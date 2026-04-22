from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex

User = get_user_model()


class Post(models.Model):
    class PostType(models.TextChoices):
        DISCUSSION  = 'discussion',       'Discussion'
        TYPOLOGY    = 'typology',         'Typology'
        REGULATORY  = 'regulatory',       'Regulatory Update'
        CASE_STUDY  = 'case_study',       'Case Study'
        QUESTION    = 'question',         'Question'
        EVENT_SHARE = 'event_share',      'Event Share'

    class Visibility(models.TextChoices):
        PUBLIC    = 'public',             'Public'
        FOLLOWERS = 'followers',          'Followers Only'
        VERIFIED  = 'verified_only',      'Verified Members Only'

    author      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content     = models.TextField()
    post_type   = models.CharField(max_length=20, choices=PostType.choices, default=PostType.DISCUSSION)
    visibility  = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.PUBLIC)
    tags        = ArrayField(models.CharField(max_length=60), default=list, blank=True)
    is_pinned   = models.BooleanField(default=False)
    image       = models.ImageField(upload_to='post_images/', blank=True, null=True)
    link_url    = models.URLField(blank=True)
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    search_vector  = SearchVectorField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']
        indexes  = [GinIndex(fields=['search_vector'])]

    def __str__(self):
        return f'{self.author.username}: {self.content[:60]}'


class Like(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post       = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'likes'
        unique_together = ('user', 'post')


class Comment(models.Model):
    author     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post       = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent     = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'comments'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.author.username} on post {self.post_id}'


class Bookmark(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    post       = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'post_bookmarks'
        unique_together = ('user', 'post')


class Report(models.Model):
    class Reason(models.TextChoices):
        SPAM        = 'spam',         'Spam'
        MISLEADING  = 'misleading',   'Misleading'
        HARASSMENT  = 'harassment',   'Harassment'
        SENSITIVE   = 'sensitive',    'Sensitive content'
        OTHER       = 'other',        'Other'

    reporter   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_filed')
    post       = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reports')
    reason     = models.CharField(max_length=20, choices=Reason.choices)
    detail     = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved   = models.BooleanField(default=False)

    class Meta:
        db_table = 'reports'
        unique_together = ('reporter', 'post')
