from ..models import Warehouse
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import WarehouseSerializer, AddressSerializer,CoordinateSerializer
from rest_framework.views import APIView
from rest_framework import status
from ..geocoding import Geocoding

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
