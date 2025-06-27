from django.urls import path
from .views import *

urlpatterns = [
    path('get-video-stream/', RoomVideoStream.as_view(), name='get_video_stream'),
    path("get-agora-token/", get_agora_token, name="get_agora_token"),
    path("leave-room/", leave_room, name = "leave_room"),
    path("get-participants/", get_participants, name = "get_participants"),
]
