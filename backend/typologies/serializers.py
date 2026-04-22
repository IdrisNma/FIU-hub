from rest_framework import serializers
from .models import TypologyCard, TypologyVote
from accounts.serializers import PublicUserSerializer


class TypologyCardSerializer(serializers.ModelSerializer):
    author    = PublicUserSerializer(read_only=True)
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model  = TypologyCard
        fields = ('id', 'title', 'sector', 'description', 'red_flags', 'references', 'tags', 'author', 'upvotes', 'has_voted', 'is_approved', 'created_at')
        read_only_fields = ('author', 'upvotes', 'is_approved', 'created_at')

    def get_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TypologyVote.objects.filter(user=request.user, typology=obj).exists()
        return False

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
