from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import FriendSerializer, MessageSerializer,VoiceMessageSerializer
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.decorators import api_view

# View to get a user's friends list
class FriendListView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        friends = Friend.objects.filter(user_a=user) | Friend.objects.filter(user_b=user) # Get all friends for user_a
        serializer = FriendSerializer(friends, many=True)
        friend_usernames = []
        for friend in serializer.data:
            if friend['user_a'] != username:
                friend_usernames.append(friend['user_a'])
            if friend['user_b'] != username:
                friend_usernames.append(friend['user_b'])

        # Remove duplicates and return as a list of usernames
        friend_usernames = list(set(friend_usernames))

        return Response(friend_usernames, status=status.HTTP_200_OK)


# View to get a user's messages
class MessageListView(APIView):
    def get(self, request, username):
        try:
            print(username)
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch all messages where the user is either the sender or receiver
        messages = Message.objects.filter(sender=user) | Message.objects.filter(receiver=user)
        messages = messages.order_by('-timestamp')  # Optional: Order by timestamp (most recent first)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


from django.utils import timezone
class MessageCreateView(APIView):
    def post(self, request, *args, **kwargs):
        sender_username = request.data.get('sender')
        receiver_username = request.data.get('receiver')
        message_content = request.data.get('message')
        timestamp = request.data.get('timestamp', timezone.now())  # Use current time if not provided

        # Fetch the sender and receiver users from the database
        try:
            sender = User.objects.get(username=sender_username)
            receiver = User.objects.get(username=receiver_username)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        print(sender,receiver)
        # Create the message
        message = Message.objects.create(
            sender=sender,
            receiver=receiver,
            message=message_content,
            timestamp=timestamp
        )

        # Serialize the message and return it
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChatMessagesView(APIView):
    def get(self, request, user1, user2):
        try:
            user1_obj = User.objects.get(username=user1)
            user2_obj = User.objects.get(username=user2)
        except User.DoesNotExist:
            return Response({"detail": "One or both users not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch messages (text)
        messages = Message.objects.filter(
            sender_id__in=[user1_obj.id, user2_obj.id], receiver_id__in=[user1_obj.id, user2_obj.id]
        ).order_by('timestamp')
        
        # Fetch voice messages
        vm = VoiceMessage.objects.filter(
            sender_id__in=[user1_obj.id, user2_obj.id], receiver_id__in=[user1_obj.id, user2_obj.id]
        ).order_by('timestamp')

        # Serialize text messages and voice messages
        serialized_txt_messages = MessageSerializer(messages, many=True)
        serialized_vm = VoiceMessageSerializer(vm, many=True)

        # Combine the serialized data into a single list
        combined_data = serialized_txt_messages.data + serialized_vm.data

        # Sort the combined data by timestamp (assuming the timestamp is included in the serialized data)
        combined_data_sorted = sorted(combined_data, key=lambda x: x['timestamp'])

        return Response(combined_data_sorted, status=status.HTTP_200_OK)
    

@api_view(['POST'])
def create_voice_message(request):
    if request.method == 'POST':
        # Extract sender, receiver, and audio file from the request data
        sender_username = request.data.get('sender')
        receiver_username = request.data.get('receiver')
        audio_file = request.data.get('audio_file')
        timestamp = request.data.get('timestamp', timezone.now())  # Use current time if not provided
        
        # Check if the required fields are provided
        if not sender_username or not receiver_username or not audio_file:
            return Response({"detail": "Sender, receiver, and audio file are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the sender and receiver users from the database
        try:
            sender = User.objects.get(username=sender_username)
            receiver = User.objects.get(username=receiver_username)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Create the voice message in the database
        voice_message = VoiceMessage.objects.create(
            sender=sender,
            receiver=receiver,
            audio_file=audio_file,
            timestamp=timestamp
        )

        # Serialize the voice message and return it
        serializer = VoiceMessageSerializer(voice_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
