import json
from channels.generic.websocket import AsyncWebsocketConsumer

from django.core.cache import cache



# This will store sync data per room in memory (you could use a database or cache in production)
room_sync_data = {}

# In Consumers.py (backend)
class RoomConsumer(AsyncWebsocketConsumer):
    import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            print(cache.__class__)
            # Extract room name from the URL
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f"room_{self.room_name}"

            # Join the group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            # Accept the WebSocket connection
            await self.accept()

            # Send a message to the client about the new user joining
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'new_message',
                }
            )
            print(f"New user connected to room: {self.room_name}")

        except Exception as e:
            # Handle connection error
            await self.close()
            print(f"Error in WebSocket connection: {e}")

        # Send current sync data to the new user (if any sync data exists)
        # sync_data = room_sync_data.get(self.room_group_name, {})
        # if sync_data:
        #     await self.send(text_data=json.dumps({
        #         'event': 'sync',
        #         'sync_data': sync_data
        #     }))

        # Accept the WebSocket connection
        

    async def disconnect(self, close_code):
        # Leave the group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data.get('event')

        if event == 'sync':
            # Handle synchronization (play/pause, timestamp, etc.)
            sync_data = data.get('sync_data', {})
            room_sync_data[self.room_group_name] = sync_data
            print("Sync:",room_sync_data[self.room_group_name])
            # Broadcast the sync data to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'sync_message',
                    'sync_data': sync_data
                }
            )

        elif event == 'upload':
            # Handle uploading a media link (video URL)
            upload_data = data.get('upload_data', {})

            # Broadcast the upload data (video URL) to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'upload_message',
                    'upload_data': upload_data
                }
            )
        elif event == 'leave':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'leave',
                    'upload_data': ""
                }
            )
    async def leave(self,event):
        await self.send(text_data=json.dumps({
            'event': 'leave',
            'upload_data': ""
        }))
    async def sync_message(self, event):
        print("In sync message")
        # Send the sync data (play/pause, timestamp, etc.) back to WebSocket clients
        sync_data = event['sync_data']
        print(sync_data)
        await self.send(text_data=json.dumps({
            'event': 'sync',
            'sync_data': sync_data
        }))

    async def upload_message(self, event):
        upload_data = event['upload_data']
        room_sync_data[self.room_group_name]={
            'video_url':upload_data,
            'timestamp':0,
            'state':'paused'
        }
        # print(room_sync_data[self.room_group_name])
        await self.send(text_data=json.dumps({
            'event': 'upload',
            'upload_data': upload_data
        }))

    async def new_message(self,event):
        await self.send(text_data=json.dumps({
            'event': 'newuser',
        }))


import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.core.cache import cache  # Using Django's cache system (which uses Redis)

class RoomChatConsumer(WebsocketConsumer):
    def connect(self):
        # Get the room name from the URL
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join the room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        # Accept the WebSocket connection
        self.accept()
         # Retrieve chat history from Redis cache (limit to 100 messages)
        messages = cache.get(self.room_group_name)
        if messages is None:
            messages = []  # If no messages exist, start with an empty list

        # Send the chat history to the WebSocket client
        self.send(text_data=json.dumps({
            "messages": messages
        }))

    def disconnect(self, close_code):
        # Leave the room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        # Receive the message, sender, and roomname from the WebSocket
        text_data_json = json.loads(text_data)
        sender = text_data_json["sender"]
        text = text_data_json["text"]
        roomname = text_data_json["roomname"]
        
        # Save the message to Redis cache (append to list)
        messages = cache.get(self.room_group_name) or []
        messages.append({"sender": sender, "text": text, "roomname": roomname})
        
        # Limit the number of stored messages (e.g., 100 messages max)
        if len(messages) > 100:
            messages = messages[-100:]

        # Save the updated message list back to Redis
        cache.set(self.room_group_name, messages, timeout=3600)  # Set cache with a timeout (e.g., 1 hour)

        # Send the message to the room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat.message",
                "sender": sender,
                "text": text,
                "roomname": roomname,
            }
        )

    def chat_message(self, event):
        # Extract the sender, text, and roomname from the event
        sender = event["sender"]
        text = event["text"]
        roomname = event["roomname"]

        # Send the message back to WebSocket
        self.send(text_data=json.dumps({
            "sender": sender,
            "text": text,
            "roomname": roomname,
        }))


import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RoomVoiceChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Accept the WebSocket connection
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f'voice_chat_{self.room_name}'

        # Join the WebSocket group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the WebSocket group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Parse the received JSON message
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        message_data = text_data_json.get('data')

        if message_type == 'offer':
            # Handle the SDP offer
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'offer_message',
                    'data': message_data,
                }
            )

        elif message_type == 'answer':
            # Handle the SDP answer
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'answer_message',
                    'data': message_data,
                }
            )

        elif message_type == 'candidate':
            # Handle ICE candidate
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'candidate_message',
                    'data': message_data,
                }
            )

    async def offer_message(self, event):
        # Send the offer to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'offer',
            'data': event['data'],
        }))

    async def answer_message(self, event):
        # Send the answer to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'answer',
            'data': event['data'],
        }))

    async def candidate_message(self, event):
        # Send the ICE candidate to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'candidate',
            'data': event['data'],
        }))
