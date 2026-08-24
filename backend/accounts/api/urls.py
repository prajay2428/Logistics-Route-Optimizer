from django.urls import path
from . import views
app_name = "accounts"

urlpatterns = [
    path("me/",views.GetUserView.as_view(),name="get_user"),
    path("register/",views.RegistrationView.as_view(), name = "register"),
    path("login/",views.LoginView.as_view(),name = "login"),
    path("logout/",views.LogoutView.as_view(), name = "logout"),
]
