from django.urls import path
from . import views
app_name = "routing"

urlpatterns = [
    path("locations/",views.LocationListView.as_view(),name = "locations"),
    path("warehouses/",views.WarehouseListView.as_view(),name = "warehouses"),
    path("add/warehouse/", views.RegisterWarehouseView.as_view(), name="add-warehouse"),
    path('delivery/locations/', views.DeliveryLocationListView.as_view(), name = "delivery_locations"),
    path('save/location/',views.SaveLocationView.as_view(),name="save_location")
]
