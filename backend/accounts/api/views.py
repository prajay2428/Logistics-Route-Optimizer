from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegistrationSerializer,LoginSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class GetUserView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        user_serializer = UserSerializer(request.user)
        return Response(user_serializer.data)


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

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response(
            {"detail": "Logged out successfully."},
            status=status.HTTP_200_OK
        )