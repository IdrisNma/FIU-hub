from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, Follow

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = UserProfile
        fields = (
            'bio', 'organization', 'job_title', 'country', 'fatf_region',
            'expertise', 'avatar', 'cover_image', 'linkedin_url', 'website_url',
            'is_verified', 'followers_count', 'following_count', 'posts_count',
        )
        read_only_fields = ('is_verified', 'followers_count', 'following_count', 'posts_count')


class PublicUserSerializer(serializers.ModelSerializer):
    profile    = UserProfileSerializer(read_only=True)
    full_name  = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'full_name', 'profile', 'is_following', 'date_joined')

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False


class MeSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model  = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'profile', 'date_joined', 'last_login')
        read_only_fields = ('email', 'date_joined', 'last_login')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance


class FollowSerializer(serializers.ModelSerializer):
    follower  = PublicUserSerializer(read_only=True)
    following = PublicUserSerializer(read_only=True)

    class Meta:
        model  = Follow
        fields = ('id', 'follower', 'following', 'created_at')
