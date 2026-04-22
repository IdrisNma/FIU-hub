import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser):
            await self.close()
            return
        self.group_name = f'notifications_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        unread = await self.get_unread_count(user)
        await self.send(text_data=json.dumps({'type': 'unread_count', 'count': unread}))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'mark_read':
            user = self.scope['user']
            await self.mark_notifications_read(user)
            await self.send(text_data=json.dumps({'type': 'unread_count', 'count': 0}))

    async def notification_message(self, event):
        await self.send(text_data=json.dumps({
            'type':        'notification',
            'id':          event['notification_id'],
            'verb':        event['verb'],
            'actor':       event.get('actor'),
            'description': event.get('description', ''),
            'timestamp':   event['timestamp'],
        }))

    @database_sync_to_async
    def get_unread_count(self, user):
        from alerts.models import Notification
        return Notification.objects.filter(recipient=user, is_read=False).count()

    @database_sync_to_async
    def mark_notifications_read(self, user):
        from alerts.models import Notification
        Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)
