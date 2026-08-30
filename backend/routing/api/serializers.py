from rest_framework import serializers
from ..models import Warehouse,Location


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

class NameCoordinateSerializer(serializers.Serializer):
    name = serializers.CharField()
    lon = serializers.DecimalField(max_digits=9,decimal_places=6)
    lat = serializers.DecimalField(max_digits=9,decimal_places=6)

class LocationSerializer(serializers.ModelSerializer):
    lat = serializers.DecimalField(source='latitude',max_digits=9,decimal_places=6)
    lon = serializers.DecimalField(source='longitude',max_digits=9,decimal_places=6)

    class Meta:
        model = Location
        fields = ['search_query','display_name','place_id','type','lat','lon']
