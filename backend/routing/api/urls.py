from django.urls import path
from . import views
app_name = "routing"

urlpatterns = [
    path("locations/",views.LocationListView.as_view(),name = "locations"),
    path("warehouses/",views.WarehouseListView.as_view(),name = "warehouses"),
]
