from rest_framework import serializers
from .models import WorkingGroup, GroupMember
from accounts.serializers import PublicUserSerializer


class WorkingGroupSerializer(serializers.ModelSerializer):
    creator   = PublicUserSerializer(read_only=True)
    is_member = serializers.SerializerMethodField()

    class Meta:
        model  = WorkingGroup
        fields = ('id', 'name', 'slug', 'description', 'cover_image', 'privacy', 'creator', 'members_count', 'is_member', 'created_at')
        read_only_fields = ('creator', 'members_count', 'created_at', 'slug')

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return GroupMember.objects.filter(group=obj, user=request.user).exists()
        return False

    def create(self, validated_data):
        from django.utils.text import slugify
        validated_data['creator'] = self.context['request'].user
        validated_data['slug'] = slugify(validated_data['name'])
        group = super().create(validated_data)
        GroupMember.objects.create(group=group, user=group.creator, role='admin')
        return group
