from django.urls import path
from .views import UserListView, FriendsListView, AddFriendView, RemoveFriendView

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('friends/<int:user_id>/', FriendsListView.as_view(), name='friends-list'),
    path('add-friend/', AddFriendView.as_view(), name='add-friend'),
    path('remove-friend/', RemoveFriendView.as_view(), name='remove-friend'),
]
