from django.contrib import admin
from .models import Warehouse,Location
# Register your models here.
@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display= ['owner','name','address','longitude','latitude']


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display=['display_name','place_id','type','longitude','latitude']
    