from django.urls import path
from .views import LoginView,GetID

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('getid/<str:username>/',GetID.as_view(),name='getid')
]
