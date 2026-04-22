from django.urls import path
from .views import NotificationListView, MarkAllReadView, MarkOneReadView, UnreadCountView

urlpatterns = [
    path('notifications/',              NotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-read/',    MarkAllReadView.as_view(),      name='mark-all-read'),
    path('notifications/<int:pk>/read/', MarkOneReadView.as_view(),     name='mark-one-read'),
    path('notifications/count/',        UnreadCountView.as_view(),      name='unread-count'),
]
