from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, LogoutView, MeView, RequestVerificationView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/',    TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/',   LogoutView.as_view(), name='logout'),
    path('me/',       MeView.as_view(), name='me'),
    path('me/request-verification/', RequestVerificationView.as_view(), name='request-verification'),
]
