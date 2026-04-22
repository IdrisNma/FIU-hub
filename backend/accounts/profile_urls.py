from django.urls import path
from .views import MemberListView, MemberDetailView, FollowView, FollowersListView, FollowingListView

urlpatterns = [
    path('',                             MemberListView.as_view(),    name='member-list'),
    path('<str:username>/',              MemberDetailView.as_view(),  name='member-detail'),
    path('<str:username>/follow/',       FollowView.as_view(),        name='follow'),
    path('<str:username>/followers/',    FollowersListView.as_view(), name='followers'),
    path('<str:username>/following/',    FollowingListView.as_view(), name='following'),
]
