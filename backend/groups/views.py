from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from .models import WorkingGroup, GroupMember
from .serializers import WorkingGroupSerializer


class GroupListView(generics.ListCreateAPIView):
    queryset = WorkingGroup.objects.select_related('creator__profile')
    serializer_class = WorkingGroupSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkingGroup.objects.select_related('creator__profile')
    serializer_class = WorkingGroupSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class JoinGroupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            group = WorkingGroup.objects.get(slug=slug)
        except WorkingGroup.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if group.privacy == 'private':
            return Response({'detail': 'This group is invite-only.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            GroupMember.objects.create(group=group, user=request.user)
            group.members_count = group.memberships.count()
            group.save()
        except IntegrityError:
            return Response({'detail': 'Already a member.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Joined group.'}, status=status.HTTP_201_CREATED)

    def delete(self, request, slug):
        try:
            group = WorkingGroup.objects.get(slug=slug)
        except WorkingGroup.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if group.creator == request.user:
            return Response({'detail': 'Group creator cannot leave.'}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = GroupMember.objects.filter(group=group, user=request.user).delete()
        if deleted:
            group.members_count = group.memberships.count()
            group.save()
        return Response({'detail': 'Left group.'})
