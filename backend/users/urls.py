from django.urls import path
from .views import FriendListView,MessageCreateView,MessageListView, ChatMessagesView,create_voice_message

urlpatterns = [
    path('friends/<str:username>/', FriendListView.as_view(), name='friend-list'),
    path('messages/<str:username>/', MessageListView.as_view(), name='message-list'),
    path('newmessage/', MessageCreateView.as_view(),name="newmessage"),
    path('chat/messages/<str:user1>/<str:user2>/', ChatMessagesView.as_view(), name='chat-messages'),
    path('create-voice-message/', create_voice_message, name='create_voice_message'),
]
