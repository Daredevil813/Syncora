from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from users.models import User
from .models import ScheduledParty, Invite
from .serializers import ScheduledPartySerializer, InviteSerializer,getScheduledPartySerializer
import logging

logger = logging.getLogger(__name__)

class ScheduledPartiesView(APIView):
    """
    API View to fetch all scheduled parties of a user in a specific month.
    """

    def get(self, request, user_id, month):
        """
        Fetch all scheduled parties of the user in the given month.
        :param user_id: ID of the user.
        :param month: Month (as a string or integer).
        """
        try:
            user = User.objects.get(id=user_id)
            print(user)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Filter parties hosted by the user in the specified month
        parties = ScheduledParty.objects.filter(
            host=user,
            date__month=int(month)
        )
        serializer = ScheduledPartySerializer(parties, many=True)
        return Response(serializer.data)


class InvitedPartiesView(APIView):
    """
    API View to fetch all parties where the user is invited in a specific month.
    """

    def get(self, request, user_id, month):
        """
        Fetch all parties the user is invited to in the given month.
        :param user_id: ID of the user.
        :param month: Month (as a string or integer).
        """
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Filter invites for the user in the specified month
        invites = Invite.objects.filter(
            user=user,
            party__date__month=int(month)
        )
        serializer = InviteSerializer(invites, many=True)
        print(serializer.data)
        return Response(serializer.data)


class InviteFriendsView(APIView):
    def post(self, request):
        party_id = request.data.get('party_id')
        user_id = request.data.get('user_id')
        
        try:
            # Fetch party and user objects
            party = ScheduledParty.objects.get(id=party_id)
            user = User.objects.get(id=user_id)
            
            # Check if the user is already invited
            if Invite.objects.filter(party=party, user=user).exists():
                return Response({"message": "User is already invited to this party"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Add user to the invited table
            Invite.objects.create(party=party, user=user)
            
            # Send email notification to the invited user
            send_mail(
                subject=f"You're Invited to {party.party_name}!",
                message=(f"Hi {user.username},\n\n"
                         f"You have been invited to the party '{party.party_name}' hosted by {party.host.username}.\n"
                         f"Details:\n"
                         f"Date: {party.date}\n"
                         f"Time: {party.time}\n\n"
                         f"Join us and have fun!\n\n"
                         f"Best regards,\nSyncora Team"),
                from_email="syncora2k24@gmail.com",  # Ensure this email is configured correctly
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({"message": "User successfully invited and email sent"}, status=status.HTTP_201_CREATED)
        
        except ScheduledParty.DoesNotExist:
            logger.error(f"Party with ID {party_id} not found.")
            return Response({"error": "Party not found"}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            logger.error(f"User with ID {user_id} not found.")
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in InviteFriendsView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CancelPartyView(APIView):
    def delete(self, request, party_id):
        try:
            # Find the party by id
            party = ScheduledParty.objects.get(id=party_id)

            # Find and delete all the related invitations
            invitations = Invite.objects.filter(party=party)
            
            # Send email to all invited friends
            for invite in invitations:
                send_mail(
                    subject="Party Cancellation",
                    message=f"The party {party.party_name} has been cancelled.",
                    from_email="syncora2k24@gmail.com",  # Ensure this email is configured correctly
                    recipient_list=[invite.user.email],
                )
            
            # Delete the invitations
            invitations.delete()

            # Delete the party
            party.delete()

            return Response({"message": "Party cancelled successfully!"}, status=200)

        except ScheduledParty.DoesNotExist:
            logger.error(f"Party with ID {party_id} not found.")
            return Response({"error": "Party not found."}, status=404)
        except Exception as e:
            logger.error(f"Error in CancelPartyView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SchedulePartyView(APIView):
    def post(self, request):
        try:
            # Log the incoming request data
            logger.info(f"Received data: {request.data}")

            serializer = getScheduledPartySerializer(data=request.data)
            
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Party scheduled successfully'}, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error in SchedulePartyView: {str(e)}")
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
