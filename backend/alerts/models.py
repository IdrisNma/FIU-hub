from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

User = get_user_model()


class Notification(models.Model):
    class Verb(models.TextChoices):
        FOLLOWED   = 'followed',         'Followed'
        LIKED      = 'liked',            'Liked'
        COMMENTED  = 'commented',        'Commented'
        MENTIONED  = 'mentioned',        'Mentioned'
        NEWS_ALERT = 'news_alert',       'News Alert'
        SYSTEM     = 'system',           'System'

    recipient     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    actor         = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='actions_sent')
    verb          = models.CharField(max_length=30, choices=Verb.choices)
    description   = models.TextField(blank=True)
    # Optional generic FK to any object (Post, NewsArticle, etc.)
    content_type  = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.SET_NULL)
    object_id     = models.PositiveIntegerField(null=True, blank=True)
    target        = GenericForeignKey('content_type', 'object_id')
    is_read       = models.BooleanField(default=False, db_index=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes  = [models.Index(fields=['recipient', 'is_read'])]

    def __str__(self):
        return f'{self.actor} {self.verb} → {self.recipient}'


def send_notification(actor, recipient, verb, description='', target=None):
    """
    Helper to create a Notification and push it over WebSocket.
    """
    if actor == recipient:
        return
    content_type = None
    object_id = None
    if target is not None:
        content_type = ContentType.objects.get_for_model(target)
        object_id = target.pk
    notif = Notification.objects.create(
        recipient=recipient,
        actor=actor,
        verb=verb,
        description=description,
        content_type=content_type,
        object_id=object_id,
    )
    _push_ws(notif)
    return notif


def _push_ws(notif):
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer
    from django.utils import timezone
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    group_name = f'notifications_{notif.recipient_id}'
    try:
        async_to_sync(channel_layer.group_send)(group_name, {
            'type':            'notification_message',
            'notification_id': notif.id,
            'verb':            notif.verb,
            'actor':           str(notif.actor) if notif.actor else None,
            'description':     notif.description,
            'timestamp':       notif.created_at.isoformat(),
        })
    except Exception:
        pass
