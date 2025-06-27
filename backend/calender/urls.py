from django.urls import path
from .views import ScheduledPartiesView, InvitedPartiesView, InviteFriendsView,CancelPartyView,SchedulePartyView
urlpatterns = [
    path('user/<int:user_id>/parties/scheduled/<int:month>/', ScheduledPartiesView.as_view(), name='scheduled-parties'),
    path('user/<int:user_id>/parties/invited/<int:month>/', InvitedPartiesView.as_view(), name='invited-parties'),
    path('invite-friend/', InviteFriendsView.as_view(), name='invite-friend'),  
    path('api/cancel-party/<int:party_id>/', CancelPartyView.as_view(), name='cancel-party'),
    path('schedule_party', SchedulePartyView.as_view(), name='schedule_party'),
]
