from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class WorkingGroup(models.Model):
    class Privacy(models.TextChoices):
        PUBLIC  = 'public',  'Public'
        PRIVATE = 'private', 'Private (Invite Only)'

    name        = models.CharField(max_length=200)
    slug        = models.SlugField(unique=True)
    description = models.TextField()
    cover_image = models.ImageField(upload_to='group_covers/', blank=True, null=True)
    privacy     = models.CharField(max_length=10, choices=Privacy.choices, default=Privacy.PUBLIC)
    creator     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    members_count = models.PositiveIntegerField(default=1)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'working_groups'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    class Role(models.TextChoices):
        MEMBER  = 'member',  'Member'
        MODERATOR = 'moderator', 'Moderator'
        ADMIN   = 'admin',   'Admin'

    group      = models.ForeignKey(WorkingGroup, on_delete=models.CASCADE, related_name='memberships')
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    role       = models.CharField(max_length=15, choices=Role.choices, default=Role.MEMBER)
    joined_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_members'
        unique_together = ('group', 'user')
