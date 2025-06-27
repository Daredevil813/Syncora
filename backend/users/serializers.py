from rest_framework import serializers
from .models import Friend, Message,VoiceMessage
from django.contrib.auth.models import User
from django.conf import settings


# Serializer for User model (for getting user's basic details)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username', 'email']  # Add other fields as needed



class FriendSerializer(serializers.ModelSerializer):
    user_a = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    user_b = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())

    class Meta:
        model = Friend
        fields = ['user_a', 'user_b']

# Serializer for Message model
class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())  # Show sender's details
    receiver = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())  # Show receiver's details
    class Meta:
        model = Message
        fields = ['sender', 'receiver', 'message', 'timestamp']


class VoiceMessageSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    receiver = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    audio_file = serializers.FileField()  # This field will automatically store the file on S3
    timestamp = serializers.DateTimeField()

    class Meta:
        model = VoiceMessage
        fields = ['id', 'sender', 'receiver', 'audio_file', 'timestamp']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Providing the full URL to the file
        representation['audio_file_url'] = f"{settings.MEDIA_URL}{instance.audio_file}"  # Adjust URL path if necessary
        return representation