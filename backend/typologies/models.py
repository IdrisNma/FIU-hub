from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField

User = get_user_model()


class TypologyCard(models.Model):
    class Sector(models.TextChoices):
        REAL_ESTATE     = 'real_estate',      'Real Estate'
        VIRTUAL_ASSETS  = 'virtual_assets',   'Virtual Assets / Crypto'
        TRADE_FINANCE   = 'trade_finance',     'Trade-Based Money Laundering'
        BANKING         = 'banking',           'Banking'
        INSURANCE       = 'insurance',         'Insurance'
        CASH_INTENSIVE  = 'cash_intensive',    'Cash-Intensive Business'
        LEGAL           = 'legal',             'Legal & Professional Services'
        DNFBP           = 'dnfbp',             'DNFBP'
        OTHER           = 'other',             'Other'

    title           = models.CharField(max_length=300)
    sector          = models.CharField(max_length=30, choices=Sector.choices)
    description     = models.TextField()
    red_flags       = ArrayField(models.TextField(), default=list)
    references      = ArrayField(models.URLField(max_length=500), default=list, blank=True)
    tags            = ArrayField(models.CharField(max_length=60), default=list, blank=True)
    author          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='typologies')
    upvotes         = models.PositiveIntegerField(default=0)
    is_approved     = models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'typology_cards'
        ordering = ['-upvotes', '-created_at']

    def __str__(self):
        return f'[{self.sector}] {self.title}'


class TypologyVote(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    typology   = models.ForeignKey(TypologyCard, on_delete=models.CASCADE, related_name='votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'typology_votes'
        unique_together = ('user', 'typology')
