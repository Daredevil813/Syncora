from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User  # Import the User model

class Room(models.Model):
    PARTY_TYPE_CHOICES = [
        (1, "Private"),
        (2, "Public"),
    ]

    party_name = models.CharField(max_length=255,unique=True)
    host = models.ForeignKey(
        'users.User',
        related_name="hosted_rooms", 
        on_delete=models.CASCADE
    )  # Host is now a foreign key to the User model
    capacity = models.PositiveIntegerField(default=0)
    type = models.PositiveSmallIntegerField(
        choices=PARTY_TYPE_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(2)],
        default=1
    )

    class Meta:
        verbose_name = "Room"
        verbose_name_plural = "Rooms"

    def __str__(self):
        return f"{self.party_name} (Host: {self.host.username})"

class RoomParticipant(models.Model):
    room = models.ForeignKey(
        Room,
        related_name='participants',
        on_delete=models.CASCADE
    )
    participant = models.ForeignKey(
        'users.User',  # Assuming User model is in the 'users' app
        related_name='rooms',
        on_delete=models.CASCADE
    )

    class Meta:
        unique_together = ('room', 'participant')  # Ensure a user can only join a room once

    def __str__(self):
        return f"{self.participant.username} in {self.room.party_name}"