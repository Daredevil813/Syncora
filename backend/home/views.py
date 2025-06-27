from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from Rooms.models import Room,RoomParticipant
from .serializers import RoomSerializer
from users.models import User
from calender.models import ScheduledParty
from django.core.exceptions import ObjectDoesNotExist

# Class-based view to get playlists for a given username
class roomview(APIView):
    def get(self, request):
        rooms = Room.objects.filter(type=2)
        if rooms.exists():
            serializer = RoomSerializer(rooms, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "No playlists found for this username"}, status=status.HTTP_404_NOT_FOUND)
        
class CreateRoom(APIView):
    def post(self, request):
        print("hi")
        print(request.data)
        # Validate and retrieve required fields from request data
        username = request.data.get("username")
        roomname = request.data.get("roomname")
        capacity = request.data.get("capacity")
        typeofroom = request.data.get("type")

        # Check for missing fields
        if not all([username, roomname, capacity, typeofroom]):
            return Response({'detail': 'All fields are required.'}, status=status.HTTP_200_OK)
        
        try:
            # Validate user existence
            user = User.objects.get(username=username)
        except ObjectDoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_200_OK)
        
        flag=Room.objects.filter(party_name=roomname)
        if flag.exists():
            return Response({'detail': 'Choose a unique party name'}, status=status.HTTP_200_OK)  
        # Check if the user already has a room
        current_party = Room.objects.filter(host=user)
        print(current_party)
        if current_party.exists():
                print("yo")
                current_party.delete()
        # User does not have an existing room, create a new one
        new_room = Room.objects.create(
            party_name=roomname,
            host=user,
            capacity=capacity,
            type=typeofroom
        )    

        
        try:
            # Retrieve the newly created room
            room_id = Room.objects.get(host=user)
        except ObjectDoesNotExist:
            return Response({'detail': 'RoomID not found'}, status=status.HTTP_200_OK)

        # Create a RoomParticipant entry
        RoomParticipant.objects.create(
            room=room_id,
            participant=user
        )
        
        return Response({'detail': 'Object created'}, status=status.HTTP_201_CREATED)
    

class joinRoom(APIView):
    def post(self, request):
        # Validate and retrieve required fields from request data
        username = request.data.get("username")
        link = request.data.get("link")
        print(username)
        print(link)

        # Check for missing fields
        if not all([username, link ]):
            return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Validate user existence
            # print("Here")
            user = User.objects.get(username=username)
            print(user)
        except ObjectDoesNotExist:
            print("Here")
            return Response({'detail': 'invalid username'}, status=status.HTTP_200_OK)
        
        try:
            part = link.rstrip('/')
            parts=part.split('/') 
            if len(parts) < 2:
                raise ValueError
            name, n = parts[-2], parts[-1]
            print(parts)
            print(f"Name: {name}, N: {n}")
        except ValueError:
            return Response({'detail': 'INVALID LINK'}, status=status.HTTP_200_OK)
        print(parts)
        if n=='h':
            current_party = Room.objects.filter(host=user)
            print(current_party)
            if current_party.exists():
                    print("yo")
                    current_party.delete()
            partic = RoomParticipant.objects.filter(participant=user)
            print('yo')
            print(partic)
            print('yo')
            if partic.exists():
                partic.delete()
            # User does not have an existing room, create a new one
            sched=ScheduledParty.objects.filter(host=user,party_name=name)
            if sched.exists():
                print(sched)
                new_room = Room.objects.create(
                    party_name=sched[0].party_name,
                    host=user,
                    capacity=sched[0].capacity,
                    type=sched[0].type
                )    
                sched.delete()
                try:
                    # Retrieve the newly created room
                    room_id = Room.objects.get(party_name=name)
                        # Create a RoomParticipant entry
                    RoomParticipant.objects.create(
                        room=room_id,
                        participant=user
                    )
                    return Response({'detail': 'Object created'}, status=status.HTTP_201_CREATED)
                except ObjectDoesNotExist:
                    return Response({'detail': 'RoomID not found'}, status=status.HTTP_404_NOT_FOUND)
            else:    
                return Response({'detail': 'RoomID not found'}, status=status.HTTP_404_NOT_FOUND)

            
        elif n=='nh':    
            try:
                print("ho")
                partic = RoomParticipant.objects.filter(participant_id=user.id)
                print(partic)
                if partic.exists():
                    partic.delete()
                # Retrieve the newly created roomget
                
                roomte = Room.objects.filter(party_name=name).first()
                     # Create a RoomParticipant entry
                     
                print(roomte)
                if roomte is not None:
                    RoomParticipant.objects.create(
                        room=roomte,
                        participant=user
                    )
                    return Response({'detail': 'Object created'}, status=status.HTTP_201_CREATED)
                else:
                    return Response({'detail': 'RoomID not found'}, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return Response({'detail': 'RoomID not found'}, status=status.HTTP_404_NOT_FOUND)

           
        
        
    