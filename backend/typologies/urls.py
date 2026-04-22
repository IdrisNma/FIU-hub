from django.urls import path
from .views import TypologyListView, TypologyDetailView, TypologyVoteView

urlpatterns = [
    path('',                   TypologyListView.as_view(),   name='typology-list'),
    path('<int:pk>/',          TypologyDetailView.as_view(), name='typology-detail'),
    path('<int:pk>/vote/',     TypologyVoteView.as_view(),   name='typology-vote'),
]
