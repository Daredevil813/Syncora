# chat/consumers.py
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

  # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        sender = text_data_json["sender"]
        receiver = text_data_json["receiver"] 
        timestamp = text_data_json["timestamp"]
        audio_file=text_data_json["audio_file"]
        print(audio_file)
        # Send all data to the room group
        if  audio_file == '': 
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "chat.message",
                    "message": message,
                    "sender": sender,
                    "receiver": receiver,
                    "timestamp": timestamp,
                }
            )
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
               {
                    "type": "voice.message",
                    "audio_file": audio_file,
                    "sender": sender,
                    "receiver": receiver,
                    "timestamp": timestamp,
                }
            )

    # Receive message from room group
    def chat_message(self, event):
        # Extract all the data from the event
        message = event["message"]
        sender = event["sender"]
        receiver = event["receiver"]
        timestamp = event["timestamp"]

        # Send all data back to WebSocket
        self.send(text_data=json.dumps({
            "message": message,
            "sender": sender,
            "receiver": receiver,
            "timestamp": timestamp,
        }))
    
    def voice_message(self, event):
        # Extract all the data from the event
        audio_file = event["audio_file"]
        sender = event["sender"]
        receiver = event["receiver"]
        timestamp = event["timestamp"]

        # Send all data back to WebSocket
        self.send(text_data=json.dumps({
            "audio_file": audio_file,
            "sender": sender,
            "receiver": receiver,
            "timestamp": timestamp,
        }))