from django.contrib import admin
from .models import User, Friend, Message

# Register models to show up in the admin panel
admin.site.register(User)
admin.site.register(Friend)
admin.site.register(Message)
