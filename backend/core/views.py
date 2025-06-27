from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from users.serializers import UserSerializer, FriendSerializer
from users.models import User, Friend
from django.db import models

class UserListView(APIView):
    """Fetch a list of all users."""

    def get(self, request):
        users = User.objects.all()
        print(users)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class FriendsListView(APIView):
    """Fetch a list of all friends for a given user."""

    def get(self, request, user_id):
        friends = Friend.objects.filter(user_a_id=user_id) | Friend.objects.filter(user_b_id=user_id)
        print(friends)
        serializer = FriendSerializer(friends, many=True)
        return Response(serializer.data)


class RemoveFriendView(APIView):
    """Remove a friendship between two users."""

    def delete(self, request):
        user_id = request.data.get('user_id')
        friend_id = request.data.get('friend_id')
        print(request.data)
        print(friend_id)
        try:
            user = User.objects.get(id=user_id)
            friend = User.objects.get(id=friend_id)

            # Filter friendships both ways due to bidirectional relationship
            friendship = Friend.objects.filter(
                (models.Q(user_a=user) & models.Q(user_b=friend)) |
                (models.Q(user_a=friend) & models.Q(user_b=user))
            )

            if not friendship.exists():
                return Response({"error": "Friendship does not exist"}, status=status.HTTP_404_NOT_FOUND)

            friendship.delete()
            return Response({"message": "Friend removed successfully"}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User or Friend not found"}, status=status.HTTP_404_NOT_FOUND)


class AddFriendView(APIView):
    """Create a friendship between two users and send an email notification."""

    def post(self, request):
        user_id = request.data.get('user_id')
        friend_id = request.data.get('friend_id')
        print(request.data)
        try:
            user = User.objects.get(id=user_id)
            friend = User.objects.get(id=friend_id)

            # Check if friendship already exists in either direction
            if Friend.objects.filter(
                (models.Q(user_a=user) & models.Q(user_b=friend)) |
                (models.Q(user_a=friend) & models.Q(user_b=user))
            ).exists():
                return Response({"message": "Friendship already exists"}, status=status.HTTP_400_BAD_REQUEST)

            # Create the friendship
            Friend.objects.create(user_a=user, user_b=friend)

            # Send email notification
            try:
                send_mail(
                    subject=f"{user.username} added you as a friend!",
                    message=(
                        f"Hi {friend.username},\n\n"
                        f"{user.username} has added you as a friend on Syncora.\n\n"
                        "Log in to your account to connect and enjoy our platform together!\n\n"
                        "Best regards,\nSyncora Team"
                    ),
                    from_email="syncora2k24@gmail.com",
                    recipient_list=[friend.email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response(
                    {"message": "Friend added, but email could not be sent", "error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response({"message": "Friend added successfully and email sent"}, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({"error": "User or Friend not found"}, status=status.HTTP_404_NOT_FOUND)
