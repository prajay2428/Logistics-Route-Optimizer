from ..models import Warehouse,Location
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import WarehouseSerializer, AddressSerializer,CoordinateSerializer,NameCoordinateSerializer,LocationSerializer,SaveLocationSerializer
from rest_framework.views import APIView
from rest_framework import status
from ..geocoding import Geocoding
from ..routing import RoutingManager
from ..optimal_routing import TSPSolver
from django.utils.text import slugify
from django.shortcuts import get_object_or_404
from .serializers import DeliveryLocationSerializer,RouteResultSerializer,GeometrySerializer,DistanceDurationSerializer,RouteSerializer
from ..routing import RoutingManager
from ..optimal_routing import TSPSolver
from django.db import transaction
class RegisterWarehouseView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        serializer = WarehouseSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        warehouse = serializer.save(owner = user)

        return Response(
            WarehouseSerializer(warehouse).data,
            status=status.HTTP_201_CREATED
        )


class LocationListView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = AddressSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        address = serializer.validated_data["address"]
        geocoding = Geocoding()
        coords = geocoding.search_locations(address = address)
        coord_serializer = CoordinateSerializer(coords,many = True)

        return Response(
            coord_serializer.data,
            status=status.HTTP_200_OK
        )


     
class WarehouseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        warehouses = Warehouse.objects.filter(owner = request.user)
        serializer = WarehouseSerializer(warehouses, many = True)

        return Response(
            serializer.data,
            status = status.HTTP_200_OK
        )

class WarehouseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,id):
        warehouse = get_object_or_404(Warehouse,id =id,owner = request.user)
        serializer = WarehouseSerializer(warehouse)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class DeliveryLocationListView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = AddressSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        address = serializer.validated_data["address"]
        search_query = slugify(address)
        locations = Location.objects.filter(search_query=search_query)
        if locations.exists():
            loc_serializer = LocationSerializer(locations,many=True)
            return Response(
                loc_serializer.data,
                status=status.HTTP_200_OK
            )
        geocoding = Geocoding()
        coords = geocoding.search_locations(address=address)
        coord_serializer = CoordinateSerializer(coords,many=True)

        return Response(
            coord_serializer.data,
            status=status.HTTP_200_OK
        )

class SaveLocationView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        serializer = SaveLocationSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        search_query = slugify(data['address'])
        location, _ = Location.objects.get_or_create(
            search_query=search_query,
            place_id=data['place_id'],
            defaults={
                'display_name': data['display_name'],
                'type': data['type'],
                'latitude': data['lat'],
                'longitude': data['lon'],
            },
        )
        return Response(
            LocationSerializer(location).data,
            status=status.HTTP_200_OK
        )


class GetOptimalRouteView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        serializer = DeliveryLocationSerializer(data = request.data,many=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        loc_names = []
        for point in data:
            loc_names.append(point['name'])
        coordinates = []

        for point in data:
            coordinates.append(point['coordinates'])

        rm = RoutingManager()
        distance_matrix,duration_matrix = rm.get_distance_matrix(coordinates)
        unoptimized_distance = 0
        unoptimized_duration = 0
        for i in range(len(distance_matrix)-1):
            unoptimized_distance += distance_matrix[i][i+1]

        unoptimized_distance += distance_matrix[len(distance_matrix)-1][0]

        for i in range(len(duration_matrix)-1):
                unoptimized_duration += duration_matrix[i][i+1]
        
        unoptimized_duration += duration_matrix[len(duration_matrix)-1][0]

            
        tsp = TSPSolver(distance_matrix=distance_matrix)
        routes = tsp.solve_tsp()
        route_coordinates = []
        
        for route_index in routes:
            route_coordinates.append(coordinates[route_index])

        

        route_path = rm.get_optimal_route(
            route_coordinates,
            operation="optimized route geometry request",
        )
        

        unoptimized_data = {
            'distance' : unoptimized_distance,
            'duration' : unoptimized_duration
        }
        route_data = {
            'route' : routes
        }
        unoptimized_route_serializer = DistanceDurationSerializer(unoptimized_data)
        route_order_serializer = RouteSerializer(route_data)
        optimized_route_serializer = RouteResultSerializer(route_path)

        return Response(
            {
            'optimized':optimized_route_serializer.data,
            'unoptimized' : unoptimized_route_serializer.data,
            'route' : route_order_serializer.data['route']
            },
            status=status.HTTP_200_OK
        )



        
