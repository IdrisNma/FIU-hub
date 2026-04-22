from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from alerts.models import send_notification
from accounts.models import Follow
from .models import Post, Like, Comment, Bookmark, Report
from .serializers import PostSerializer, PostCreateSerializer, CommentSerializer

User = get_user_model()


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class HomeFeedView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        following_ids = Follow.objects.filter(
            follower=self.request.user
        ).values_list('following_id', flat=True)
        return Post.objects.filter(
            Q(author_id__in=following_ids) | Q(author=self.request.user)
        ).select_related('author', 'author__profile').order_by('-created_at')


class PublicFeedView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['post_type', 'author__username']
    search_fields = ['content', 'tags']
    ordering_fields = ['created_at', 'likes_count']
    ordering = ['-created_at']

    def get_queryset(self):
        return Post.objects.filter(
            visibility='public'
        ).select_related('author', 'author__profile')


class PostCreateView(generics.CreateAPIView):
    serializer_class = PostCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.save()
        post.author.profile.posts_count = post.author.posts.count()
        post.author.profile.save()


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.select_related('author', 'author__profile')
    permission_classes = [IsAuthorOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return PostCreateSerializer
        return PostSerializer


class TrendingTagsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        from django.contrib.postgres.aggregates import ArrayAgg
        from django.db.models import Count
        cutoff = timezone.now() - timedelta(hours=24)
        posts = Post.objects.filter(created_at__gte=cutoff, tags__len__gt=0)
        tag_counts = {}
        for post in posts.values_list('tags', flat=True):
            for tag in post:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:20]
        return Response([{'tag': t, 'count': c} for t, c in sorted_tags])


class LikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            Like.objects.create(user=request.user, post=post)
            post.likes_count = post.likes.count()
            post.save()
            if post.author != request.user:
                send_notification(request.user, post.author, 'liked', target=post)
        except IntegrityError:
            return Response({'detail': 'Already liked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'likes_count': post.likes_count}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        deleted, _ = Like.objects.filter(user=request.user, post_id=pk).delete()
        if not deleted:
            return Response({'detail': 'Not liked.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            post = Post.objects.get(pk=pk)
            post.likes_count = post.likes.count()
            post.save()
            return Response({'likes_count': post.likes_count})
        except Post.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


class CommentListView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(
            post_id=self.kwargs['pk'], parent=None
        ).select_related('author', 'author__profile').prefetch_related('replies__author__profile')

    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs['pk'])
        comment = serializer.save(author=self.request.user, post=post)
        post.comments_count = post.comments.count()
        post.save()
        if post.author != self.request.user:
            send_notification(self.request.user, post.author, 'commented', target=post)


class BookmarkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            Bookmark.objects.create(user=request.user, post=post)
        except IntegrityError:
            return Response({'detail': 'Already bookmarked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Bookmarked.'}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        deleted, _ = Bookmark.objects.filter(user=request.user, post_id=pk).delete()
        if not deleted:
            return Response({'detail': 'Not bookmarked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Bookmark removed.'})


class BookmarkedPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(
            bookmarks__user=self.request.user
        ).select_related('author', 'author__profile').order_by('-bookmarks__created_at')


class ReportPostView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            Report.objects.create(
                reporter=request.user,
                post=post,
                reason=request.data.get('reason', 'other'),
                detail=request.data.get('detail', '')
            )
        except IntegrityError:
            return Response({'detail': 'Already reported.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Report submitted.'}, status=status.HTTP_201_CREATED)
