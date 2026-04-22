from django.urls import path
from .views import QuestionListView, QuestionDetailView, AnswerCreateView, AcceptAnswerView, AnswerVoteView

urlpatterns = [
    path('',                                          QuestionListView.as_view(),   name='question-list'),
    path('<int:pk>/',                                QuestionDetailView.as_view(), name='question-detail'),
    path('<int:pk>/answers/',                        AnswerCreateView.as_view(),    name='answer-create'),
    path('<int:pk>/answers/<int:answer_pk>/accept/', AcceptAnswerView.as_view(),    name='accept-answer'),
    path('answers/<int:answer_pk>/vote/',            AnswerVoteView.as_view(),      name='answer-vote'),
]
