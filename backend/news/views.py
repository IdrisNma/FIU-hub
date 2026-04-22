from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend
from .models import NewsArticle, SavedArticle, AlertSubscription
from .serializers import NewsArticleSerializer, AlertSubscriptionSerializer


class NewsListView(generics.ListAPIView):
    queryset = NewsArticle.objects.all()
    serializer_class = NewsArticleSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured', 'source_name']
    search_fields = ['title', 'description', 'source_name']
    ordering_fields = ['published_at', 'relevance_score']
    ordering = ['-published_at']


class NewsDetailView(generics.RetrieveAPIView):
    queryset = NewsArticle.objects.all()
    serializer_class = NewsArticleSerializer
    permission_classes = [permissions.AllowAny]


class SaveArticleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            article = NewsArticle.objects.get(pk=pk)
        except NewsArticle.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            SavedArticle.objects.create(user=request.user, article=article)
        except IntegrityError:
            return Response({'detail': 'Already saved.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Article saved.'}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        deleted, _ = SavedArticle.objects.filter(user=request.user, article_id=pk).delete()
        if not deleted:
            return Response({'detail': 'Not saved.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Removed from saved.'})


class SavedArticlesView(generics.ListAPIView):
    serializer_class = NewsArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NewsArticle.objects.filter(
            saves__user=self.request.user
        ).order_by('-saves__created_at')


class AlertSubscriptionView(generics.ListCreateAPIView):
    serializer_class = AlertSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AlertSubscription.objects.filter(user=self.request.user)


class AlertSubscriptionDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = AlertSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AlertSubscription.objects.filter(user=self.request.user)


class TriggerNewsFetchView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        from .tasks import fetch_all_news
        fetch_all_news.delay()
        return Response({'detail': 'News fetch triggered.'})
