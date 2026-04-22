from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Event(models.Model):
    class EventType(models.TextChoices):
        CONFERENCE   = 'conference',   'Conference'
        PLENARY      = 'plenary',      'FATF Plenary'
        WEBINAR      = 'webinar',      'Webinar'
        TRAINING     = 'training',     'Training'
        WORKSHOP     = 'workshop',     'Workshop'
        EGMONT       = 'egmont',       'EGMONT Meeting'
        OTHER        = 'other',        'Other'

    title        = models.CharField(max_length=300)
    event_type   = models.CharField(max_length=15, choices=EventType.choices, default=EventType.CONFERENCE)
    description  = models.TextField()
    start_date   = models.DateTimeField(db_index=True)
    end_date     = models.DateTimeField()
    location     = models.CharField(max_length=300, blank=True)
    is_virtual   = models.BooleanField(default=False)
    url          = models.URLField(blank=True)
    organizer    = models.CharField(max_length=200, blank=True)
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='events_created')
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'events'
        ordering = ['start_date']

    def __str__(self):
        return f'{self.title} ({self.start_date.date()})'
