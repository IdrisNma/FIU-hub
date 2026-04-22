from rest_framework import serializers
from django.contrib.auth import get_user_model
from accounts.serializers import PublicUserSerializer
from .models import Post, Like, Comment, Bookmark

User = get_user_model()


class CommentSerializer(serializers.ModelSerializer):
    author   = PublicUserSerializer(read_only=True)
    replies  = serializers.SerializerMethodField()

    class Meta:
        model  = Comment
        fields = ('id', 'author', 'content', 'parent', 'replies', 'created_at', 'updated_at')
        read_only_fields = ('author', 'created_at', 'updated_at')

    def get_replies(self, obj):
        if obj.parent is None:
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []


class PostSerializer(serializers.ModelSerializer):
    author      = PublicUserSerializer(read_only=True)
    is_liked    = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    tags        = serializers.ListField(child=serializers.CharField(max_length=60), required=False)

    class Meta:
        model  = Post
        fields = (
            'id', 'author', 'content', 'post_type', 'visibility', 'tags',
            'image', 'link_url', 'is_pinned', 'likes_count', 'comments_count',
            'is_liked', 'is_bookmarked', 'created_at', 'updated_at',
        )
        read_only_fields = ('author', 'likes_count', 'comments_count', 'created_at', 'updated_at')

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, post=obj).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(max_length=60), required=False)

    class Meta:
        model  = Post
        fields = ('content', 'post_type', 'visibility', 'tags', 'image', 'link_url')

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
