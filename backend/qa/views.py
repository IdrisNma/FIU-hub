from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend
from .models import Question, Answer, AnswerVote
from .serializers import QuestionSerializer, AnswerSerializer


class QuestionListView(generics.ListCreateAPIView):
    queryset = Question.objects.select_related('author__profile').prefetch_related('answers__author__profile')
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_closed', 'author__username']
    search_fields = ['title', 'body', 'tags']
    ordering_fields = ['created_at', 'views', 'answer_count']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.select_related('author__profile').prefetch_related('answers__author__profile')
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.views += 1
        obj.save()
        return super().retrieve(request, *args, **kwargs)


class AnswerCreateView(generics.CreateAPIView):
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        question = Question.objects.get(pk=self.kwargs['pk'])
        answer = serializer.save(question=question)
        question.answer_count = question.answers.count()
        question.save()


class AcceptAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, answer_pk):
        try:
            question = Question.objects.get(pk=pk, author=request.user)
            answer   = Answer.objects.get(pk=answer_pk, question=question)
        except (Question.DoesNotExist, Answer.DoesNotExist):
            return Response({'detail': 'Not found or not authorized.'}, status=status.HTTP_404_NOT_FOUND)
        Answer.objects.filter(question=question).update(is_accepted=False)
        answer.is_accepted = True
        answer.save()
        question.accepted_answer = answer
        question.save()
        return Response({'detail': 'Answer accepted.'})


class AnswerVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, answer_pk):
        value = int(request.data.get('value', 1))
        if value not in (1, -1):
            return Response({'detail': 'value must be 1 or -1'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            answer = Answer.objects.get(pk=answer_pk)
        except Answer.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        vote, created = AnswerVote.objects.update_or_create(
            user=request.user, answer=answer,
            defaults={'value': value},
        )
        answer.upvotes = sum(v.value for v in answer.votes.all())
        answer.save()
        return Response({'upvotes': answer.upvotes})
