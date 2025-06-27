from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from users.models import User

class SignupView(APIView):
    def get(self, request):
        username = request.data.get("username")
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists. Please choose a different username."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"message": "Username is available."}, status=status.HTTP_200_OK)

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        
           
        user = User.objects.create(
            username=username,
            email=email,
            password=password,
        )
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
