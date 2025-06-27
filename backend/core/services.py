from users.models import User

class UserService:
    @staticmethod
    def get_friends(user):
        """
        Returns a list of friends for the given user.
        """
        return user.friends.all()
