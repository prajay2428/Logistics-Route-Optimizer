import requests
class RoutingManager():

    def __init__(self):
        self.BASE_URL = "http://router.project-osrm.org/table/v1/driving/"


    def get_distance_matrix(self,coords):


        # assuming that this will receive [[lon1,lat1],[lon2,lat2]]..
        coordinates =""
        for lon,lat in coords:
            coordinates +=str(lon)+','+str(lat)+';'

        coordinates = coordinates[:-1]

        url = self.BASE_URL + coordinates

        params = {
            "annotations" : "distance",

        }
        headers = {
                    "User-Agent" : "LRO-route-optimizer/1.0"
                }
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=10
        )
        response.raise_for_status()

        data = response.json()
        
        matrix = data['distances']

        rows,cols = len(matrix),len(matrix[0])

        for r in range(rows):
            for c in range(cols):
                matrix[r][c] = int(matrix[r][c] * 10)

        return matrix





