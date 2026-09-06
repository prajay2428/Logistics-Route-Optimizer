import requests
from time import perf_counter

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

        started_at = perf_counter()
        try:
            response = requests.get(
                self.BASE_URL,
                params=params,
                headers=headers,
                timeout=10
            )
        finally:
            elapsed = perf_counter() - started_at
            print(
                "[PERF][EXTERNAL SERVICE] "
                f"Nominatim | location search request | {elapsed:.3f}s",
                flush=True,
            )
        response.raise_for_status()

        data = response.json()
        results = []

        for info in data:
            result = {
                "place_id" : info["place_id"],
                "display_name" : info["display_name"],
                "type" : info["type"],
                "lat" : info["lat"],
                "lon" : info["lon"],
            }
            results.append(result)

        return results
