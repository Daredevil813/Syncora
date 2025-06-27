from django.db import models
from users.models import User

class playlist(models.Model):
    username = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE
    )  # Stores the username
    playlist_name = models.CharField(max_length=100)  # Stores the playlist name

    class Meta:
        unique_together = ('username', 'playlist_name')  # Ensure the combination is unique

    def __str__(self):
        return f"{self.username} - {self.playlist_name}"
    
class playlistdata(models.Model):
    username = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE
    )
    link = models.URLField(max_length=255)
    playlist_name = models.CharField(max_length=100)
    name = models.CharField(max_length=255, unique=True,default='default_name')

    def __str__(self):
        return f"{self.username} - {self.playlist_name}"  