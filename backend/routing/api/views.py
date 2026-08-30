from ..models import Warehouse,Location
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import WarehouseSerializer, AddressSerializer,CoordinateSerializer,NameCoordinateSerializer,LocationSerializer
from rest_framework.views import APIView
from rest_framework import status
from ..geocoding import Geocoding
from ..routing import RoutingManager
from ..optimal_routing import TSPSolver
from django.utils.text import slugify

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
        serializer = LocationSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        location, _ = Location.objects.get_or_create(
            search_query=data['search_query'],
            place_id=data['place_id'],
            defaults={
                'display_name': data['display_name'],
                'type': data['type'],
                'latitude': data['latitude'],
                'longitude': data['longitude'],
            },
        )
        return Response(
            LocationSerializer(location).data,
            status=status.HTTP_200_OK
        )
