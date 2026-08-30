from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp


class TSPSolver:

    def __init__(self, distance_matrix):
        self.distance_matrix = distance_matrix
        self.num_vehicles = 1
        self.depot = 0

    def solve_tsp(self):
        manager = pywrapcp.RoutingIndexManager(
            len(self.distance_matrix),
            self.num_vehicles,
            self.depot
        )

        routing = pywrapcp.RoutingModel(manager)

        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)

            return self.distance_matrix[from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(
            distance_callback
        )

        routing.SetArcCostEvaluatorOfAllVehicles(
            transit_callback_index
        )

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()

        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )

        solution = routing.SolveWithParameters(search_parameters)

        if not solution:
            return None

        routes = []

        for vehicle in range(routing.vehicles()):
            index = routing.Start(vehicle)

            route = [manager.IndexToNode(index)]

            while not routing.IsEnd(index):
                index = solution.Value(routing.NextVar(index))
                route.append(manager.IndexToNode(index))

            routes.append(route)

        return routes