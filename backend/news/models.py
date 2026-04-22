from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex

User = get_user_model()


class NewsArticle(models.Model):
    class Category(models.TextChoices):
        SANCTIONS   = 'sanctions',    'Sanctions'
        FATF        = 'fatf',         'FATF / FSRB'
        REGULATORY  = 'regulatory',   'Regulatory Update'
        ENFORCEMENT = 'enforcement',  'Enforcement Action'
        CRYPTO_AML  = 'crypto_aml',   'Crypto & Virtual Assets AML'
        TYPOLOGY    = 'typology',     'Typology & Red Flags'
        GENERAL     = 'general',      'General Financial Crime'

    title           = models.CharField(max_length=500)
    description     = models.TextField(blank=True)
    content         = models.TextField(blank=True)
    url             = models.URLField(max_length=1000, unique=True)
    url_to_image    = models.URLField(max_length=1000, blank=True)
    source_name     = models.CharField(max_length=200)
    source_id       = models.CharField(max_length=100, blank=True)
    author          = models.CharField(max_length=300, blank=True)
    published_at    = models.DateTimeField(db_index=True)
    fetched_at      = models.DateTimeField(auto_now_add=True)
    category        = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    relevance_score = models.FloatField(default=0.0, db_index=True)
    is_featured     = models.BooleanField(default=False)
    search_vector   = SearchVectorField(null=True, blank=True)

    class Meta:
        db_table = 'news_articles'
        ordering = ['-published_at']
        indexes  = [GinIndex(fields=['search_vector'])]

    def __str__(self):
        return f'[{self.category}] {self.title[:80]}'


class SavedArticle(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_articles')
    article    = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name='saves')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_articles'
        unique_together = ('user', 'article')


class AlertSubscription(models.Model):
    TOPIC_CHOICES = [
        ('sanctions', 'Sanctions'),
        ('fatf', 'FATF'),
        ('aml', 'AML'),
        ('cft', 'CFT'),
        ('crypto_aml', 'Crypto AML'),
        ('enforcement', 'Enforcement'),
        ('regulatory', 'Regulatory'),
        ('typology', 'Typology'),
    ]
    user     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alert_subscriptions')
    topic    = models.CharField(max_length=30, choices=TOPIC_CHOICES)
    keywords = models.CharField(max_length=500, blank=True, help_text='Comma-separated custom keywords')
    is_email = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'alert_subscriptions'
        unique_together = ('user', 'topic')
