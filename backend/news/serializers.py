from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import NewsArticle, SavedArticle, AlertSubscription

User = get_user_model()


class NewsArticleSerializer(serializers.ModelSerializer):
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model  = NewsArticle
        fields = (
            'id', 'title', 'description', 'url', 'url_to_image',
            'source_name', 'author', 'published_at', 'category',
            'relevance_score', 'is_featured', 'is_saved',
        )

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedArticle.objects.filter(user=request.user, article=obj).exists()
        return False


class AlertSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AlertSubscription
        fields = ('id', 'topic', 'keywords', 'is_email', 'created_at')
        read_only_fields = ('created_at',)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
