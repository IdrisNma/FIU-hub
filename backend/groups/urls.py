from django.urls import path
from .views import GroupListView, GroupDetailView, JoinGroupView

urlpatterns = [
    path('',              GroupListView.as_view(),   name='group-list'),
    path('<slug:slug>/',  GroupDetailView.as_view(), name='group-detail'),
    path('<slug:slug>/join/', JoinGroupView.as_view(), name='group-join'),
]
