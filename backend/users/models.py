from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone

# Custom User Manager
class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")

        user = self.model(
            username=username,
            email=self.normalize_email(email),
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None):
        user = self.create_user(
            username=username,
            email=email,
            password=password,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

# User Model
class User(AbstractBaseUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin

# Friends Model
class Friend(models.Model):
    user_a = models.ForeignKey(User, related_name='user_a_friends', on_delete=models.CASCADE)
    user_b = models.ForeignKey(User, related_name='user_b_friends', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user_a', 'user_b')

    def __str__(self):
        return f"{self.user_a.username} is friends with {self.user_b.username}"

# Messages Model
class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username} at {self.timestamp}"


class VoiceMessage(models.Model):
    sender = models.ForeignKey(User, related_name='sent_voice_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_voice_messages', on_delete=models.CASCADE)
    audio_file = models.FileField(upload_to='voice_messages/')
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Voice message from {self.sender.username} to {self.receiver.username} at {self.timestamp}"
