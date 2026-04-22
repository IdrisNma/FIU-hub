import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fiuhub.settings')

# Must call get_asgi_application() to load apps BEFORE any model/consumer imports
djangoasgi = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import alerts.routing

application = ProtocolTypeRouter({
    'http': djangoasgi,
    'websocket': AuthMiddlewareStack(
        URLRouter(alerts.routing.websocket_urlpatterns)
    ),
})
