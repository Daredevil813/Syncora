from rest_framework import serializers
from Rooms.models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = [
            'id',            # Include the ID field for referencing specific instances
            'party_name',
            'host',
            'capacity',
            'type',
        ]
