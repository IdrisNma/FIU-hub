from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField

User = get_user_model()


class Question(models.Model):
    author          = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')
    title           = models.CharField(max_length=400)
    body            = models.TextField()
    tags            = ArrayField(models.CharField(max_length=60), default=list, blank=True)
    views           = models.PositiveIntegerField(default=0)
    answer_count    = models.PositiveIntegerField(default=0)
    is_closed       = models.BooleanField(default=False)
    accepted_answer = models.OneToOneField('Answer', null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    created_at      = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'qa_questions'
        ordering = ['-created_at']


class Answer(models.Model):
    question   = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    author     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')
    body       = models.TextField()
    upvotes    = models.IntegerField(default=0)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'qa_answers'
        ordering = ['-is_accepted', '-upvotes', 'created_at']


class AnswerVote(models.Model):
    VOTE_CHOICES = [(1, 'Upvote'), (-1, 'Downvote')]
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    answer     = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='votes')
    value      = models.SmallIntegerField(choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table     = 'qa_answer_votes'
        unique_together = ('user', 'answer')
