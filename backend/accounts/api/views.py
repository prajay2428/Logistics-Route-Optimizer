from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from .serializers import UserSerializer, RegistrationSerializer,LoginSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status


class CsrfTokenView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"csrfToken": get_token(request)})

class GetUserView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        user_serializer = UserSerializer(request.user)
        return Response(user_serializer.data)


@method_decorator(csrf_protect, name="dispatch")
class RegistrationView(APIView):
    permission_classes=[AllowAny]

    def post(self,request):
        serializer = RegistrationSerializer(data = request.data)

        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            UserSerializer(user).data,
            status = status.HTTP_201_CREATED
        )

@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        serializer = LoginSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(
            username = username,
            password = password
        )

        if user is None:
            return Response(
                {'detail' : "Invalid username or password"},
                status = status.HTTP_401_UNAUTHORIZED
            )

        auth_login(request, user)

        return Response({
            "user": UserSerializer(user).data,
            # Django rotates the CSRF secret at login, so return the new token.
            "csrfToken": get_token(request),
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        auth_logout(request)

        return Response(
            {
                "detail": "Logged out successfully.",
                "csrfToken": get_token(request),
            },
            status=status.HTTP_200_OK
        )
