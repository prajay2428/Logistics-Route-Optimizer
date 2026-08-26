from rest_framework import serializers
from ..models import Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = "__all__"
        read_only_fields = ["owner"]

class AddressSerializer(serializers.Serializer):
    address = serializers.CharField(max_length = 300)

class CoordinateSerializer(serializers.Serializer):
    place_id = serializers.IntegerField()
    display_name = serializers.CharField()
    type = serializers.CharField()
    lat = serializers.DecimalField(max_digits=9,decimal_places=6)
    lon = serializers.DecimalField(max_digits=9,decimal_places=6)