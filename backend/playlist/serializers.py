# playlist/serializers.py
from rest_framework import serializers
from .models import User,playlist ,playlistdata # Assuming you have a User model



class playlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = playlist
        fields = ['id', 'username', 'playlist_name']

class playlistdataSerializer(serializers.ModelSerializer):
    class Meta:
        model = playlistdata
        fields = ['id', 'username','link' ,'playlist_name','name']         