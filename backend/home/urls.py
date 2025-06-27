from django.urls import path
from .views import roomview,CreateRoom,joinRoom


urlpatterns = [
    path('', roomview.as_view(), name='room_data'),
    path('createroom/',CreateRoom.as_view(),name='createroom'),
    path('joinroom/',joinRoom.as_view(),name='joinroom')

]