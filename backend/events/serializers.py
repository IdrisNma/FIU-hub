from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Event
        fields = ('id', 'title', 'event_type', 'description', 'start_date', 'end_date', 'location', 'is_virtual', 'url', 'organizer', 'created_at')
        read_only_fields = ('created_at',)
