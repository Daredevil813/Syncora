from django.urls import path
from . import consumers

room_urlpatterns = [
    path('ws/room/<str:room_name>/', consumers.RoomConsumer.as_asgi()),
    path('ws/roomChat/<str:room_name>/', consumers.RoomChatConsumer.as_asgi()),
]
