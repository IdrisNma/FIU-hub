from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend
from .models import TypologyCard, TypologyVote
from .serializers import TypologyCardSerializer


class TypologyListView(generics.ListCreateAPIView):
    serializer_class = TypologyCardSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sector', 'is_approved']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['upvotes', 'created_at']
    ordering = ['-upvotes']

    def get_queryset(self):
        return TypologyCard.objects.filter(is_approved=True).select_related('author__profile')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class TypologyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TypologyCard.objects.select_related('author__profile')
    serializer_class = TypologyCardSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class TypologyVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            card = TypologyCard.objects.get(pk=pk)
        except TypologyCard.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            TypologyVote.objects.create(user=request.user, typology=card)
            card.upvotes = card.votes.count()
            card.save()
        except IntegrityError:
            return Response({'detail': 'Already voted.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'upvotes': card.upvotes}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        deleted, _ = TypologyVote.objects.filter(user=request.user, typology_id=pk).delete()
        if deleted:
            try:
                card = TypologyCard.objects.get(pk=pk)
                card.upvotes = card.votes.count()
                card.save()
                return Response({'upvotes': card.upvotes})
            except TypologyCard.DoesNotExist:
                pass
        return Response({'detail': 'Not voted.'}, status=status.HTTP_400_BAD_REQUEST)
