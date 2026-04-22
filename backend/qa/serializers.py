from rest_framework import serializers
from .models import Question, Answer, AnswerVote
from accounts.serializers import PublicUserSerializer


class AnswerSerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)

    class Meta:
        model  = Answer
        fields = ('id', 'author', 'body', 'upvotes', 'is_accepted', 'created_at', 'updated_at')
        read_only_fields = ('author', 'upvotes', 'is_accepted', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class QuestionSerializer(serializers.ModelSerializer):
    author  = PublicUserSerializer(read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model  = Question
        fields = ('id', 'author', 'title', 'body', 'tags', 'views', 'answer_count', 'is_closed', 'accepted_answer', 'answers', 'created_at', 'updated_at')
        read_only_fields = ('author', 'views', 'answer_count', 'is_closed', 'accepted_answer', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
