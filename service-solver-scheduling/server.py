from ortools.sat.python import cp_model


def main() -> None:
   
    num_employees = 14
    num_shifts = 4
    num_days = 5
    all_employees = range(num_employees)
    all_shifts = range(num_shifts)
    all_days = range(num_days)


    model = cp_model.CpModel()

 
    shifts = {}
    for n in all_employees:
        for d in all_days:
            for s in all_shifts:
                shifts[(n, d, s)] = model.new_bool_var(f"shift_n{n}_d{d}_s{s}")


    for d in all_days:
        for s in all_shifts:
            model.add_exactly_one(shifts[(n, d, s)] for n in all_employees)

    # Each employee works at most one shift per day.
    for n in all_employees:
        for d in all_days:
            model.add_at_most_one(shifts[(n, d, s)] for s in all_shifts)

    # Try to distribute the shifts evenly, so that each employee works
    # min_shifts_per_employee shifts. If this is not possible, because the total
    # number of shifts is not divisible by the number of employees, some employees will
    # be assigned one more shift.
    min_shifts_per_employee = (num_shifts * num_days) // num_employees
    if num_shifts * num_days % num_employees == 0:
        max_shifts_per_employee = min_shifts_per_employee
    else:
        max_shifts_per_employee = min_shifts_per_employee + 1
    for n in all_employees:
        shifts_worked = []
        for d in all_days:
            for s in all_shifts:
                shifts_worked.append(shifts[(n, d, s)])
        model.add(min_shifts_per_employee <= sum(shifts_worked))
        model.add(sum(shifts_worked) <= max_shifts_per_employee)

    # Creates the solver and solve.
    solver = cp_model.CpSolver()
    solver.parameters.linearization_level = 0
    # Enumerate all solutions.
    solver.parameters.enumerate_all_solutions = True

    class employeesPartialSolutionPrinter(cp_model.CpSolverSolutionCallback):
        """Print intermediate solutions."""

        def __init__(self, shifts, num_employees, num_days, num_shifts, limit):
            cp_model.CpSolverSolutionCallback.__init__(self)
            self._shifts = shifts
            self._num_employees = num_employees
            self._num_days = num_days
            self._num_shifts = num_shifts
            self._solution_count = 0
            self._solution_limit = limit

        def on_solution_callback(self):
            self._solution_count += 1
            print(f"Solution {self._solution_count}")
            for d in range(self._num_days):
                print(f"Day {d}")
                for n in range(self._num_employees):
                    is_working = False
                    for s in range(self._num_shifts):
                        if self.value(self._shifts[(n, d, s)]):
                            is_working = True
                            print(f"  employee {n} works shift {s}")
                    if not is_working:
                        print(f"  employee {n} does not work")
            if self._solution_count >= self._solution_limit:
                print(f"Stop search after {self._solution_limit} solutions")
                self.stop_search()

        def solutionCount(self):
            return self._solution_count

    # Display the first five solutions.
    solution_limit = 5
    solution_printer = employeesPartialSolutionPrinter(
        shifts, num_employees, num_days, num_shifts, solution_limit
    )

    solver.solve(model, solution_printer)

    # Statistics.
    print("\nStatistics")
    print(f"  - conflicts      : {solver.num_conflicts}")
    print(f"  - branches       : {solver.num_branches}")
    print(f"  - wall time      : {solver.wall_time} s")
    print(f"  - solutions found: {solution_printer.solutionCount()}")


if __name__ == "__main__":
    main()