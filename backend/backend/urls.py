from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),  # Include the app-level URLs here
    path('Room/',include('Rooms.urls')),
    path('core/',include('core.urls')),
    path('calender/',include('calender.urls')),
    path('playlist/',include('playlist.urls')),
    path('home/',include('home.urls')),
    path('sign/', include('sign.urls')),
    path('login/', include('login.urls')),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)