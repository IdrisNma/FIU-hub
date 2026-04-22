from django.urls import path
from .views import CountryListView, CountryDetailView

urlpatterns = [
    path('',               CountryListView.as_view(),  name='country-list'),
    path('<str:iso_code>/', CountryDetailView.as_view(), name='country-detail'),
]
