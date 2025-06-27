from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import User


from django.contrib.auth import authenticate

class LoginView(APIView):

    
    def post(self, request):
        u_username = request.data.get('username')
        password = request.data.get('password')

        print(f"Received username: {u_username}, password: {password}")

        if not u_username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Use authenticate to validate credentials
        user = User.objects.filter(username=u_username, password=password)
        if user:
            return Response({'message': 'Login successful!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


class GetID(APIView):

    def get(self,request,username):
        user=User.objects.get(username=username)
        return Response({'data':user.id},status=status.HTTP_200_OK)