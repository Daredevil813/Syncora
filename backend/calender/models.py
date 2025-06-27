from django.db import models
from users.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class ScheduledParty(models.Model):
    PARTY_TYPE_CHOICES = [
        (1, "Private"),
        (2, "Public"),
    ]

    party_name = models.CharField(max_length=255)
    date = models.DateField()
    time = models.TimeField()
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hosted_parties")
    capacity = models.PositiveIntegerField()
    type = models.PositiveSmallIntegerField(
        choices=PARTY_TYPE_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(2)],
        default=1
    )

    class Meta:
        verbose_name = "Scheduled Party"
        verbose_name_plural = "Scheduled Parties"

    def __str__(self):
        return f"{self.party_name} (Host: {self.host.username})"


class Invite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="invites")
    party = models.ForeignKey(ScheduledParty, on_delete=models.CASCADE, related_name="invited_users")

    class Meta:
        unique_together = ('user', 'party')
        verbose_name = "Party Invite"
        verbose_name_plural = "Party Invites"

    def __str__(self):
        return f"{self.user.username} invited to {self.party.party_name}"

