from django.urls import path
from .views import (
    HomeFeedView, PublicFeedView, PostCreateView, PostDetailView,
    LikeView, CommentListView, BookmarkView, BookmarkedPostsView,
    ReportPostView, TrendingTagsView,
)

urlpatterns = [
    path('feed/',              HomeFeedView.as_view(),        name='home-feed'),
    path('public/',            PublicFeedView.as_view(),      name='public-feed'),
    path('create/',            PostCreateView.as_view(),      name='post-create'),
    path('bookmarked/',        BookmarkedPostsView.as_view(), name='bookmarked-posts'),
    path('trending-tags/',     TrendingTagsView.as_view(),    name='trending-tags'),
    path('<int:pk>/',          PostDetailView.as_view(),      name='post-detail'),
    path('<int:pk>/like/',     LikeView.as_view(),            name='post-like'),
    path('<int:pk>/comments/', CommentListView.as_view(),     name='post-comments'),
    path('<int:pk>/bookmark/', BookmarkView.as_view(),        name='post-bookmark'),
    path('<int:pk>/report/',   ReportPostView.as_view(),      name='post-report'),
]
