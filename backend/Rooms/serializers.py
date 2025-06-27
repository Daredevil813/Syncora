# from rest_framework import serializers
# from .models import Room, RoomParticipant
# from users.models import User  # Assuming the User model is in the 'users' app


# class RoomParticipantSerializer(serializers.ModelSerializer):
#     # Include the participant's username as a readable field in the serialization
#     participant_username = serializers.CharField(source='participant.username', read_only=True)
    
#     class Meta:
#         model = RoomParticipant
#         fields = ['id', 'room', 'participant', 'participant_username', 'joined_at']


# class RoomSerializer(serializers.ModelSerializer):
#     creator_username = serializers.CharField(source='creator.username', read_only=True)
#     participants = RoomParticipantSerializer(many=True, read_only=True)  # Nested serialization for participants
    
#     class Meta:
#         model = Room
#         fields = ['id', 'name', 'description', 'creator', 'creator_username', 'room_permissions', 'password', 'current_video', 'slug', 'created_at', 'updated_at', 'participants']
    
#     def validate(self, data):
#         # Validate password if the room is private
#         if data.get('room_permissions') == 'private' and not data.get('password'):
#             raise serializers.ValidationError("Password is required for private rooms.")
#         return data
