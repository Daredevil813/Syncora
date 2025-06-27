from django.db import models

# class User(models.Model):
#     username = models.CharField(max_length=50)
#     email = models.EmailField(unique=True)

#     def __str__(self):  
#         return self.username


# class Friend(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends")
#     friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend_of")

#     class Meta:
#         unique_together = ('user', 'friend')

#     def __str__(self):
#         return f"{self.user} -> {self.friend}"
