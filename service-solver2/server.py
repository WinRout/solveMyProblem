
import json
import time
import datetime
import subprocess
from math import radians, sin, cos, sqrt, atan2
from confluent_kafka import Consumer, Producer

def run_submission(script_content, input_content):
    # Write the script content to a temporary file
    script_path = './temp_script.py'
    with open(script_path, 'w') as file:
        file.write(script_content)

    # Execute the Python script and measure the execution time
    start_time = time.time()

    try:
        result = subprocess.run(['python3', script_path, input_content], capture_output=True, text=True, timeout=60)
        output = result.stdout
        error = result.stderr
    except subprocess.TimeoutExpired:
        output = ''
        error = 'Script execution timed out.'

    end_time = time.time()
    running_time = (end_time - start_time) # in seconds

    # Clean up: remove the temporary script file
    subprocess.run(['rm', script_path])
    return {
        'output': output,
        'error': error,
        'running_time': running_time
    }

def kafka_consumer():
    # Setup Kafka consumer
    consumer = Consumer({
        'bootstrap.servers': 'kafka-broker:9092', 
        'group.id': 'service-solver',
        'client.id': 'service-solver2',
        'auto.offset.reset': 'earliest'
        })
    # Setup Kafka Producer
    producer = Producer({
    'bootstrap.servers': 'kafka-broker:9092',
    'client.id': 'service-solver2',
    })
    
    consumer.subscribe(['solver-request'])
    print('Service solver is running.')
    while True:

        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            print("Consumer error: {}".format(msg.error()))
            continue

        if (msg.topic() == 'solver-request'):
            data = msg.value().decode('utf-8')
            data_dict = json.loads(data)
        
            # inform that execution is starting
            produce_output(producer, 'solver-execution-start', {'email':data_dict['email'], 'submission_name':data_dict['submission_name']}) 

            result = run_submission(data_dict['code'], data_dict['input_data'])
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            data_to_sent = {}
            data_to_sent["email"] = data_dict['email']
            data_to_sent["submission_name"] = data_dict["submission_name"]
        
            data_to_sent['output_data'] = result['output']
            data_to_sent['error'] = result['error']
            data_to_sent['execution_secs'] = result['running_time']
            data_to_sent['execution_date'] = now
            produce_output(producer, 'solver-response', data_to_sent)

            minimal_data = {
                "email": data_to_sent["email"],
                "submission_name": data_to_sent["submission_name"],
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
