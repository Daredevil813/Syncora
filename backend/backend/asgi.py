import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")

# Initialize Django ASGI application
django_asgi_app = get_asgi_application()

# Import WebSocket URL patterns
from users.routing import websocket_urlpatterns as user_websocket_urlpatterns
from Rooms.routing import room_urlpatterns

# Combine WebSocket URL patterns
websocket_urlpatterns = user_websocket_urlpatterns + room_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                URLRouter(websocket_urlpatterns)
            )
        ),
    }
)
