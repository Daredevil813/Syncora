from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import yt_dlp


class RoomVideoStream(APIView):
    def post(self, request):
        video_url = request.data.get('url', None)

        if not video_url:
            return Response({"error": "No video URL provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # yt-dlp options to prioritize 720p or higher resolution by default
            ydl_opts = {
                'format': 'bestvideo[height>=720]+bestaudio/best',  # Prefer video with at least 720p resolution and best audio
                'noplaylist': True,  # Ensure only a single video is processed
                'quiet': True,  # Suppress verbose output
                'extractaudio': True,  # Extract audio if necessary
                'merge_output_format': 'mp4',  # Merge video and audio into an mp4 file
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Extract information about the video
                info_dict = ydl.extract_info(video_url, download=False)

                # Check if formats are available
                if 'formats' not in info_dict:
                    return Response({"error": "No formats available for this video"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # Collect formats with resolution (144p, 240p, 360p, 720p, etc.)
                available_formats = []
                for fmt in info_dict['formats']:
                    if fmt.get('vcodec') != 'none' and fmt.get('acodec') != 'none':  # Ensure it's video + audio
                        resolution = f"{fmt.get('height')}p" if fmt.get('height') else "Audio only"
                        available_formats.append({
                            "resolution": resolution,
                            "url": fmt.get('url'),
                            "format": fmt.get('format'),
                            "filesize": fmt.get('filesize')
                        })

                if not available_formats:
                    return Response({"error": "No valid quality options available"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # Check for 720p or higher resolution
                best_video = None
                for fmt in available_formats:
                    if fmt['resolution'] in ['720p', '1080p', '1440p', '2160p']:
                        best_video = fmt
                        break  # Pick the highest resolution first

                # If no high resolution found, fallback to the best available (could be 360p or lower)
                if not best_video:
                    best_video = available_formats[0]

                # Debug: print the final selected video quality
                print(f"Selected Best Video: Resolution: {best_video['resolution']}, URL: {best_video['url']}")

                # Return only the URL of the best video stream
                return Response({
                    "stream_url": best_video['url']
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


from django.http import JsonResponse
from .utils import generate_agora_token

def get_agora_token(request):
    channel_name = request.GET.get("channelName")
    uid = int(request.GET.get("uid", 0))  # Default UID is 0 for anonymous users
    role = request.GET.get("role", "publisher")

    if not channel_name:
        return JsonResponse({"error": "Channel name is required"}, status=400)

    token = generate_agora_token(channel_name, uid, role)
    return JsonResponse({"token": token})


from .models import Room, RoomParticipant
from users.models import User

def leave_room(request):
    room_name = request.GET.get("room_name")
    user_name = request.GET.get("user_name")

    if not room_name or not user_name:
        return JsonResponse({"error": "Both room_name and user_name are required"}, status=400)
    
    room_id = Room.objects.get(party_name=room_name).id
    user_id = User.objects.get(username=user_name).id

    # if user is the host of the room, delete the room
    room = Room.objects.get(id=room_id)
    if room.host.id == user_id:
        room.delete()
        return JsonResponse({"message": "Room deleted successfully"}, status=200)
    else:

        try:
            participant = RoomParticipant.objects.get(room=room.id, participant=user_id)
            participant.delete()
            return JsonResponse({"message": "User left the room successfully"}, status=200)
        except RoomParticipant.DoesNotExist:
            return JsonResponse({"error": "User is not a participant in the room"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)



#a view to get all participants in a room
def get_participants(request):
    room_name = request.GET.get("room_name")

    if not room_name:
        return JsonResponse({"error": "Room name is required"}, status=400)

    room_id = Room.objects.get(party_name=room_name).id

    participants = RoomParticipant.objects.filter(room=room_id)
    participants_list = []
    for participant in participants:
        participants_list.append(participant.participant.username)

    #append the name of the parties host

    return JsonResponse({"participants": participants_list})