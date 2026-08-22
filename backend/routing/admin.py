from django.contrib import admin
from .models import Warehouse
# Register your models here.
@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display= ['owner','name','address','longitude','latitude']
    