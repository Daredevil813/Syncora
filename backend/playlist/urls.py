from django.urls import path
from .views import PlaylistListView, PlaylistDataListView,PlaylistDeleteView

# urlpatterns = [
#     path('playlist/<str:username>/', get_playlist, name='get_playlist'),
#     path('playlist/<str:username>/<str:playlist_name>/',get_playlistdata , name='get_playlistdata')

# ]

urlpatterns = [
    path('', PlaylistListView.as_view(), name='create_playlist'),
    # URL pattern for getting playlists for a given username
    path('<str:username>/', PlaylistListView.as_view(), name='get_playlist'),
    # URL pattern for getting playlist data for a given username and playlist name
    path('<str:username>/<str:playlist_name>/', PlaylistDataListView.as_view(), name='get_playlistdata'),
    path('<str:username>/<str:playlist_name>/<str:name>/', PlaylistDeleteView.as_view(), name='delete_playlist_data')

]