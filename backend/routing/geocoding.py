import requests

class Geocoding():
    def __init__(self):
        self.BASE_URL = "https://nominatim.openstreetmap.org/search"
    


    def search_locations(self,address):
        params = {
            "q":address,
            "format" :"jsonv2",
            "limit" : 5,
            "countrycodes" : "in",
        }

        headers = {
            "User-Agent" : "LRO-route-optimizer/1.0"
        }

        response = requests.get(
            self.BASE_URL,
            params=params,
            headers=headers,
            timeout=10
        )
        response.raise_for_status()

        data = response.json()
        results = []

        for info in data:
            result = {
                "display_name" : info["display_name"],
                "type" : info["type"],
                "lat" : info["lat"],
                "lon" : info["lon"],
            }
            results.append(result)

        return results