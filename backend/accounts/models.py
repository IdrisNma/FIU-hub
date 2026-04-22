from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    class FATFRegion(models.TextChoices):
        FATF      = 'FATF',     'FATF'
        APG       = 'APG',      'Asia/Pacific Group'
        MENAFATF  = 'MENAFATF', 'Middle East & North Africa FATF'
        ESAAMLG   = 'ESAAMLG',  'Eastern & Southern Africa'
        GABAC     = 'GABAC',    'Central Africa'
        GAFILAT   = 'GAFILAT',  'Latin America'
        EAG       = 'EAG',      'Eurasian Group'
        GIABA     = 'GIABA',    'Inter-Governmental Action Group West Africa'
        CFATF     = 'CFATF',    'Caribbean FATF'
        MONEYVAL  = 'MONEYVAL', 'Council of Europe MONEYVAL'
        OTHER     = 'OTHER',    'Other'

    user            = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio             = models.TextField(blank=True)
    organization    = models.CharField(max_length=255, blank=True)
    job_title       = models.CharField(max_length=150, blank=True)
    country         = models.CharField(max_length=100, blank=True)
    fatf_region     = models.CharField(max_length=20, choices=FATFRegion.choices, blank=True)
    expertise       = ArrayField(models.CharField(max_length=60), default=list, blank=True)
    avatar          = models.ImageField(upload_to='avatars/', blank=True, null=True)
    cover_image     = models.ImageField(upload_to='covers/', blank=True, null=True)
    linkedin_url    = models.URLField(blank=True)
    website_url     = models.URLField(blank=True)
    is_verified     = models.BooleanField(default=False)
    verification_requested = models.BooleanField(default=False)
    followers_count = models.PositiveIntegerField(default=0)
    following_count = models.PositiveIntegerField(default=0)
    posts_count     = models.PositiveIntegerField(default=0)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f'{self.user.get_full_name()} — {self.organization}'


class Follow(models.Model):
    follower    = models.ForeignKey(User, related_name='following_set', on_delete=models.CASCADE)
    following   = models.ForeignKey(User, related_name='followers_set', on_delete=models.CASCADE)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'follows'
        unique_together = ('follower', 'following')
        indexes = [models.Index(fields=['following'])]

    def __str__(self):
        return f'{self.follower.email} -> {self.following.email}'
