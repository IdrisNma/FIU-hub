from django.urls import path
from .views import (
    NewsListView, NewsDetailView, SaveArticleView, SavedArticlesView,
    AlertSubscriptionView, AlertSubscriptionDetailView, TriggerNewsFetchView,
)

urlpatterns = [
    path('',                   NewsListView.as_view(),             name='news-list'),
    path('saved/',             SavedArticlesView.as_view(),        name='saved-articles'),
    path('alerts/',            AlertSubscriptionView.as_view(),    name='alert-subscriptions'),
    path('alerts/<int:pk>/',   AlertSubscriptionDetailView.as_view(), name='alert-detail'),
    path('fetch/',             TriggerNewsFetchView.as_view(),     name='trigger-fetch'),
    path('<int:pk>/',          NewsDetailView.as_view(),           name='news-detail'),
    path('<int:pk>/save/',     SaveArticleView.as_view(),          name='save-article'),
]
