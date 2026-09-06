import requests
from time import perf_counter


def _print_external_service_timing(service, operation, started_at):
    elapsed = perf_counter() - started_at
    print(
        f"[PERF][EXTERNAL SERVICE] {service} | {operation} | {elapsed:.3f}s",
        flush=True,
    )


class RoutingManager():

    def __init__(self):
        self.BASE_URL_TABLE = "http://router.project-osrm.org/table/v1/driving/"
        self.BASE_URL_ROUTE = "http://router.project-osrm.org/route/v1/driving/"


    def get_distance_matrix(self,coords):


        # assuming that this will receive [[lon1,lat1],[lon2,lat2]]..
        coordinates =""
        for lon,lat in coords:
            coordinates +=str(lon)+','+str(lat)+';'

        coordinates = coordinates[:-1]

        url = self.BASE_URL_TABLE + coordinates

        params = {
            "annotations" : "distance,duration",

        }
        headers = {
                    "User-Agent" : "LRO-route-optimizer/1.0"
                }
        started_at = perf_counter()
        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=10
            )
        finally:
            _print_external_service_timing(
                "OSRM",
                "distance matrix request",
                started_at,
            )
        
        response.raise_for_status()

        data = response.json()
        
        distance_matrix = data['distances']
        duration_matrix = data['durations']

        for r in range(len(distance_matrix)):
            for c in range(len(distance_matrix[r])):
                distance_matrix[r][c] = round(distance_matrix[r][c])
       

        return [distance_matrix,duration_matrix]

    def get_optimal_route(self, coords, operation="route geometry request"):


        coordinates =""
        for lon,lat in coords:
            coordinates +=str(lon)+','+str(lat)+';'

        
        coordinates = coordinates[:-1]
        
        url = self.BASE_URL_ROUTE + coordinates

        params = {
            "geometries" : "geojson",
            "overview" : "full"
        }
        headers = {
                    "User-Agent" : "LRO-route-optimizer/1.0"
                }
        
        started_at = perf_counter()
        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=10
            )
        finally:
            _print_external_service_timing(
                "OSRM",
                operation,
                started_at,
            )
        
        response.raise_for_status()
        data = response.json()
        route = data["routes"][0]
        geometry = route["geometry"]
        distance = route["distance"]
        duration = route["duration"]

        final_data = {
            "geometry" : geometry,
            "distance" : distance,
            "duration" : duration
        }

        return final_data




