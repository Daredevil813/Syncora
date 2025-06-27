from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import playlist, playlistdata
from users.models import User
from .serializers import playlistSerializer, playlistdataSerializer

# Class-based view to get playlists for a given username
class PlaylistListView(APIView):
    def get(self, request, username):
        sender = User.objects.get(username=username)
        playlists = playlist.objects.filter(username_id=sender.id)
        if playlists.exists():
            serializer = playlistSerializer(playlists, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No playlists found for this username"}, status=status.HTTP_404_NOT_FOUND)
        
    # def post(self, request):
    #         print(request.data)
    #         sender = User.objects.get(username=request.data.get("username"))
    #         inputdata={"username": sender,  # Use sender's ID as user_id
    #         "playlist_name": request.data.get("playlist_name")  }
    #         serializer = playlistSerializer(data=inputdata)
    #         print("Input Data:", inputdata)
    #         print("Input Data:", serializer)
            
    #         if serializer.is_valid():
    #             serializer.save()
    #             return Response(serializer.data, status=status.HTTP_201_CREATED)
    #         else:
    #             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def post(self, request):
        sender = User.objects.get(username=request.data.get("username"))
        inputdata = {
            "username": sender.id,  # Passing the User instance
            "playlist_name": request.data.get("playlist_name")
        }
        serializer = playlistSerializer(data=inputdata)
        print(serializer);
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Class-based view to get playlist data for a given username and playlist name
class PlaylistDataListView(APIView):
    def get(self, request, username, playlist_name):
        sender = User.objects.get(username=username)
        playlists = playlistdata.objects.filter(username_id=sender.id, playlist_name=playlist_name)
        if playlists.exists():
            serializer = playlistdataSerializer(playlists, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No playlist data found for this username and playlist name"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, username, playlist_name):
        # Add username and playlist_name to the request data
        sender = User.objects.get(username=username)
        inputdata = {
            "username": sender.id,  # Passing the User instance
            "playlist_name": request.data.get("playlist_name"),
            "name":request.data.get("name")
        }
        print(f"Received playlist_name: {inputdata}")  # Debug output
        data = request.data.copy()
        data['username'] = sender.id
        data['playlist_name'] = playlist_name

        serializer = playlistdataSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        


    def delete(self, request, username, playlist_name):
        """
        Handle DELETE request to remove a playlist.
        """
        try:
            print('in playlist delete')
            print(playlist_name)
            sender = User.objects.get(username=username)
            print(f"Sender ID: {sender.id}")
            print(f"Playlist Name: {playlist_name}")
            playlist_data_entries = playlistdata.objects.filter(username_id=sender.id, playlist_name=playlist_name)
            print(playlist_data_entries)
            if playlist_data_entries.exists():
                print("yo")
                playlist_data_entries.delete()
               
            # Delete the playlist
            playlist_data = playlist.objects.filter(username=sender.id,playlist_name=playlist_name)
            if playlist_data:
                playlist_data.delete()
            

            return Response({"message": "Playlist and associated data deleted successfully!"}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PlaylistDeleteView(APIView):
    def delete(self, request, username, playlist_name, name):
        """
        Handle DELETE request to remove a specific playlist data entry.
        """
        try:
            # Get the specific playlist data entry
            sender = User.objects.get(username=username)
            print(f"Sender ID: {sender.id}")
            playlist_entry = get_object_or_404(
                playlistdata,
                username_id=sender.id,
                playlist_name=playlist_name,
                name=name
            )
            print(playlist_entry)
            # Delete the entry
            playlist_entry.delete()

            return Response({"message": "Playlist data deleted successfully!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
