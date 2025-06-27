from rest_framework import serializers
from users.models import User

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError("Both username and password are required.")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid username or password.")

    
        from django.contrib.auth.hashers import check_password
        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid username or password.")

        data['user'] = user
        return data
