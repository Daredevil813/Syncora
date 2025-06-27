# from __future__ import absolute_import, unicode_literals
# from celery import shared_task
from django.core.mail import send_mail
from datetime import date, timedelta
from .models import ScheduledParty, Invite
import logging
logger = logging.getLogger(__name__)
# @shared_task
def send_party_reminders():
    logger.info("Send party reminders task executed.")
    print("Send party reminders task executed.")
    tomorrow = date.today() + timedelta(days=1)
    parties = ScheduledParty.objects.filter(date=tomorrow)

    for party in parties:
        # Send email to the host
        send_mail(
            subject=f"Reminder: Your Party '{party.party_name}' is Tomorrow!",
            message=(
                f"Hi {party.host.username},\n\n"
                f"This is a reminder that your party '{party.party_name}' "
                f"is scheduled for tomorrow.\n\n"
                f"Details:\n"
                f"Date: {party.date}\n"
                f"Time: {party.time}\n"
                f"Link: http://localhost:3000/RoomPage/{party.id}/h/\n\n"
                f"Do not share this link with anyone!!"
                f"Best regards,\n"
                f"Syncora Team"
            ),
    from_email="syncora2k24@gmail.com",
    recipient_list=[party.host.email],
)


        # Send emails to all invited users
        invites = Invite.objects.filter(party=party)
        for invite in invites:
            send_mail(
                subject=f"Reminder: Party '{party.party_name}' Tomorrow!",
                message=(f"Hi {invite.user.username},\n\n"
                         f"This is a reminder that you are invited to the party '{party.party_name}' "
                         f"hosted by {party.host.username} tomorrow.\n\n"
                         f"Details:\n"
                         f"Date: {party.date}\n"
                         f"Time: {party.time}\n"
                          f"Link: http://localhost:3000/RoomPage/{party.id}/nh/\n\n"
                         f"Join us and have fun!\n\n"
                         f"Best regards,\nSyncora Team"),
                from_email="syncora2k24@gmail.com",
                recipient_list=[invite.user.email],
            )
            
