
import json
import time
import datetime

from math import radians, sin, cos, sqrt, atan2
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from confluent_kafka import Consumer, Producer



def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great-circle distance between two points on the Earth's surface."""
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = 6371 * c  # Earth radius in kilometers
    return int(round(1000 * distance))

def calculate_distance_matrix(locations):
    """Calculate distance matrix based on Manhattan distance."""
    num_locations = len(locations)
    distance_matrix = [[0]*num_locations for _ in range(num_locations)]

    for i in range(num_locations):
        for j in range(num_locations):
            lat1, lon1 = locations[i]['Latitude'], locations[i]['Longitude']
            lat2, lon2 = locations[j]['Latitude'], locations[j]['Longitude']
            distance_matrix[i][j] = haversine_distance(lat1, lon1, lat2, lon2)
    return distance_matrix

def create_data_model(locations, num_vehicles, depot):
    """Stores the data for the problem."""
    data = {}
    data["distance_matrix"] = calculate_distance_matrix(locations)
    data["num_vehicles"] = num_vehicles
    data["depot"] = depot
    return data

def solution_to_list(data, manager, routing, solution):
    routes = []
    for vehicle_id in range(data["num_vehicles"]):
        veh_route = []
        index = routing.Start(vehicle_id)
        while not routing.IsEnd(index):
            veh_route.append(manager.IndexToNode(index))
            previous_index = index
            index = solution.Value(routing.NextVar(index))

        veh_route.append(manager.IndexToNode(index))
        routes.append(veh_route)
    return routes

def solution_to_text(data, manager, routing, solution):
    """Returns solution as text."""
    text = ''
    text += f"Objective: {solution.ObjectiveValue()}\n"
    max_route_distance = 0
    for vehicle_id in range(data["num_vehicles"]):
        index = routing.Start(vehicle_id)
        plan_output = f"Route for vehicle {vehicle_id}:\n"
        route_distance = 0
        while not routing.IsEnd(index):
            plan_output += f" {manager.IndexToNode(index)} -> "
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(
                previous_index, index, vehicle_id
            )
        plan_output += f"{manager.IndexToNode(index)}\n"
        plan_output += f"Distance of the route: {route_distance}m\n"
        text += plan_output
        max_route_distance = max(route_distance, max_route_distance)
    text += f"Maximum of the route distances: {max_route_distance}m"
    return text

def read_json_string(data):

    locations = data.get('Locations', []) # Access the "Locations" array
    num_vehicles = data.get('num_vehicles', 1)  # Assuming NumVehicles is a key containing a number
    depot = data.get('depot', 0)  # Assuming Depot is a key containing a number
    max_distance = data.get('max_distance', 100000) # Assuming MaxDistance is a key containing a number
    return locations, num_vehicles, depot, max_distance

def run_submission(input_data, max_secs):

    print('Running a submission...')

    """Entry point of the program."""
    # if len(sys.argv) != 5:
    #     print("Wrong number of args.\nUsage: python <script_name.py> <input_file.json> <num_vehicles> <depot> <max_distance>")
    #     sys.exit(1)

    # Read JSON file
    locations, num_vehicles, depot, max_distance = read_json_string(input_data)

    # Instantiate the data problem.
    data = create_data_model(locations, num_vehicles, depot)

    # Create the routing index manager.
    manager = pywrapcp.RoutingIndexManager(
        len(data["distance_matrix"]), data["num_vehicles"], data["depot"]
    )

    # Create Routing Model.
    routing = pywrapcp.RoutingModel(manager)

    # Create and register a transit callback.
    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        # Convert from routing variable Index to distance matrix NodeIndex.
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data["distance_matrix"][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    # Define cost of each arc.
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Add Distance constraint.
    dimension_name = "Distance"
    routing.AddDimension(
        transit_callback_index,
        0,  # no slack
        max_distance,  # vehicle maximum travel distance
        True,  # start cumul to zero
        dimension_name,
    )
    distance_dimension = routing.GetDimensionOrDie(dimension_name)
    distance_dimension.SetGlobalSpanCostCoefficient(100)

    # Setting first solution heuristic.
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.time_limit.seconds = max_secs
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    # Solve the problem.
    start_time = time.time()
    solution = routing.SolveWithParameters(search_parameters)
    end_time = time.time()
    print('Ended execution')

    time_taken_seconds = int(end_time - start_time)

    if solution:
        sol_text = solution_to_text(data, manager, routing, solution)
        sol_list = solution_to_list(data, manager, routing, solution)
    else:
        sol_text = 'No solution found'
        sol_list = []

    print(f"execution time: {time_taken_seconds}")
    return sol_text, sol_list, time_taken_seconds


def kafka_consumer():
    # Setup Kafka consumer
    consumer = Consumer({
        'bootstrap.servers': 'localhost:29092', 
        'group.id': 'service-solver-routing',
        'client.id': 'service-solver-routing',
        # 'auto.offset.reset': 'smallest'
        })
    # Setup Kafka Producer
    producer = Producer({
    'bootstrap.servers': 'localhost:29092',
    'client.id': 'service-solver-routing',
    })
    
    consumer.subscribe(['solver-routing-request'])
    print('Service solver routing is running.')
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            print("Consumer error: {}".format(msg.error()))
            continue
        print('received message')
        # data = msg.value().decode('utf-8')
        # print(json.loads(data))
        if (msg.topic() == 'solver-routing-request'):
            data = msg.value().decode('utf-8')
            data_dict = json.loads(data)
            sol_text, sol_list, time_taken_seconds = run_submission(data_dict['input_data'], data_dict['max_secs'])
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            data_to_sent = {}
            data_to_sent["email"] = data_dict['email']
            data_to_sent["submission_name"] = data_dict["submission_name"]
        
            data_to_sent['output_data'] = {
                "text": sol_text,
                "list": sol_list
            }
            data_to_sent['execution_secs'] = time_taken_seconds
            data_to_sent['execution_date'] = now
            produce_output(producer, 'solver-routing-response', data_to_sent)

            minimal_data = {
                "email": data_to_sent["email"],
                "solver_type": "routing", # Don't forget to change in others solvers
                "execution_date": data_to_sent["execution_date"],
                "execution_secs": data_to_sent["execution_secs"]
            }
            produce_output(producer, 'solvers-general-response', minimal_data)

def produce_output(producer, topic, data):
    producer.produce(topic, value=json.dumps(data))
    producer.poll(200)
    # producer.flush()
    print(f'message to {topic} published!')

if __name__ == '__main__':
    kafka_consumer()
