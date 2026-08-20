from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = get_user_model()
        fields = ["id","username","email"]


class RegistrationSerializer(serializers.Serializer):
    
    username = serializers.CharField(max_length = 50)
    email = serializers.EmailField(max_length = 100)
    password = serializers.CharField(max_length = 30)
    password2 = serializers.CharField(max_length = 30)

    def validate(self,attrs):
        if User.objects.filter(username = attrs["username"]).exists():
            raise serializers.ValidationError(
                {'username' : 'this username is already taken'}
            )
        if User.objects.filter(email = attrs["email"]).exists():
                    
                    
                    raise serializers.ValidationError(
                        {'email' : 'this email already exists'}
                    )
        if attrs["password"] != attrs["password2"]:
             raise serializers.ValidationError(
                  {'password' : 'passwords do not match '}
             )

        return attrs

    def create(self,validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(
             username=validated_data["username"],
             email=validated_data["email"],
             password=validated_data["password"]
        )
        return user

         
         
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
             