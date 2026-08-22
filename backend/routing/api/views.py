from ..models import Warehouse
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import WarehouseSerializer
from rest_framework.views import APIView
from rest_framework import status

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

        

