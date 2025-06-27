from rest_framework import serializers
from .models import ScheduledParty, Invite

class ScheduledPartySerializer(serializers.ModelSerializer):
    # Nested host information
    host_details = serializers.SerializerMethodField()

    class Meta:
        model = ScheduledParty
        fields = ['id', 'party_name', 'date', 'time', 'host', 'host_details', 'capacity','type']

    def get_host_details(self, obj):
        return {
            "id": obj.host.id,
            "username": obj.host.username,
            "email": obj.host.email
        }

class getScheduledPartySerializer(serializers.ModelSerializer):
    # Nested host information
    class Meta:
        model = ScheduledParty
        fields = ['id', 'party_name', 'date', 'time', 'host','capacity','type']



class InviteSerializer(serializers.ModelSerializer):
    # Nested user and party details
    user_details = serializers.SerializerMethodField()
    party_details = serializers.SerializerMethodField()

    class Meta:
        model = Invite
        fields = ['id', 'user', 'user_details', 'party', 'party_details', ]

    def get_user_details(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email
        }

    def get_party_details(self, obj):
        return {
            "id": obj.party.id,
            "party_name": obj.party.party_name,
            "date": obj.party.date,
            "time": obj.party.time,
            "host": obj.party.host.username,
            "capacity": obj.party.capacity,
            "type":obj.party.type
        }
