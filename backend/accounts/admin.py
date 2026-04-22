from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, Follow


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2')}),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'organization', 'country', 'fatf_region', 'is_verified', 'verification_requested')
    list_filter = ('is_verified', 'verification_requested', 'fatf_region')
    search_fields = ('user__email', 'organization', 'country')
    actions = ['approve_verification']

    @admin.action(description='Approve verification for selected profiles')
    def approve_verification(self, request, queryset):
        queryset.update(is_verified=True, verification_requested=False)


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ('follower', 'following', 'created_at')
    raw_id_fields = ('follower', 'following')
