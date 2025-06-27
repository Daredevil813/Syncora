from django.contrib import admin
from .models import Room, RoomParticipant

# In Rooms/admin.py
def register_rooms():
    from .models import Room, RoomParticipant
    admin.site.register(Room)
    admin.site.register(RoomParticipant)

register_rooms()

