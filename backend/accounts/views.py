from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend
from .models import UserProfile, Follow
from .serializers import RegisterSerializer, PublicUserSerializer, MeSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': MeSerializer(user).data,
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data['refresh'])
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class RequestVerificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        if profile.is_verified:
            return Response({'detail': 'Already verified.'}, status=status.HTTP_400_BAD_REQUEST)
        profile.verification_requested = True
        profile.save()
        return Response({'detail': 'Verification request submitted.'})


class MemberListView(generics.ListAPIView):
    queryset = User.objects.select_related('profile').filter(is_active=True)
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['profile__country', 'profile__fatf_region', 'profile__is_verified']
    search_fields = ['first_name', 'last_name', 'username', 'profile__organization', 'profile__country']
    ordering_fields = ['date_joined', 'profile__followers_count']
    ordering = ['-date_joined']


class MemberDetailView(generics.RetrieveAPIView):
    queryset = User.objects.select_related('profile').filter(is_active=True)
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'username'


class FollowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        try:
            target = User.objects.get(username=username, is_active=True)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        if target == request.user:
            return Response({'detail': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            Follow.objects.create(follower=request.user, following=target)
            target.profile.followers_count = target.followers_set.count()
            target.profile.save()
            request.user.profile.following_count = request.user.following_set.count()
            request.user.profile.save()
            from alerts.models import send_notification
            send_notification(request.user, target, 'followed')
        except IntegrityError:
            return Response({'detail': 'Already following.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Now following.'}, status=status.HTTP_201_CREATED)

    def delete(self, request, username):
        try:
            target = User.objects.get(username=username, is_active=True)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        deleted, _ = Follow.objects.filter(follower=request.user, following=target).delete()
        if not deleted:
            return Response({'detail': 'Not following.'}, status=status.HTTP_400_BAD_REQUEST)
        target.profile.followers_count = target.followers_set.count()
        target.profile.save()
        request.user.profile.following_count = request.user.following_set.count()
        request.user.profile.save()
        return Response({'detail': 'Unfollowed.'})


class FollowersListView(generics.ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.filter(
            following_set__following__username=self.kwargs['username']
        ).select_related('profile')


class FollowingListView(generics.ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.filter(
            followers_set__follower__username=self.kwargs['username']
        ).select_related('profile')
