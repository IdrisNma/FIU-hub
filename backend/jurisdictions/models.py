from django.db import models
from django.contrib.postgres.fields import ArrayField


class Country(models.Model):
    class FATFStatus(models.TextChoices):
        COMPLIANT   = 'compliant',   'Largely Compliant'
        PARTIALLY   = 'partially',   'Partially Compliant'
        NON_COMPLIANT = 'non_compliant', 'Non-Compliant / Deficient'
        ENHANCED    = 'enhanced',     'Enhanced Monitoring (Grey List)'
        BLACKLISTED = 'blacklisted',  'High-Risk (Black List)'
        NOT_RATED   = 'not_rated',    'Not Yet Rated'

    name                 = models.CharField(max_length=200, unique=True)
    iso_code             = models.CharField(max_length=3, unique=True)
    flag_emoji           = models.CharField(max_length=10, blank=True)
    fatf_status          = models.CharField(max_length=20, choices=FATFStatus.choices, default=FATFStatus.NOT_RATED)
    fatf_region          = models.CharField(max_length=100, blank=True)
    last_evaluation_year = models.PositiveSmallIntegerField(null=True, blank=True)
    next_evaluation_year = models.PositiveSmallIntegerField(null=True, blank=True)
    fiu_name             = models.CharField(max_length=300, blank=True)
    fiu_website          = models.URLField(blank=True)
    primary_legislation  = models.TextField(blank=True)
    aml_summary          = models.TextField(blank=True)
    key_risks            = ArrayField(models.CharField(max_length=200), default=list, blank=True)
    mutual_evaluation_url = models.URLField(blank=True)
    egmont_member        = models.BooleanField(default=False)
    last_updated         = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'countries'
        ordering  = ['name']
        verbose_name_plural = 'countries'

    def __str__(self):
        return f'{self.name} ({self.iso_code})'
