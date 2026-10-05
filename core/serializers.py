from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User, Candidate, Company, Job, Application


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'role']

    def validate_role(self, value):
        # Admins can only be created from the terminal (createsuperuser)
        if value not in ('candidate', 'company'):
            raise serializers.ValidationError(
                "Role must be 'candidate' or 'company'."
            )
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == 'candidate':
            Candidate.objects.create(user=user, cv_file_path='')
        elif user.role == 'company':
            Company.objects.create(user=user, company_name=user.name)

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'date_joined']


class CVUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = ['cv_file_path']


class CompanySerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'company_name', 'industry', 'approved', 'email']
        read_only_fields = ['id', 'approved', 'email']

    def validate_company_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Company name cannot be empty.')
        return value


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'required_skills', 'status', 'posted_date', 'company_name']
        read_only_fields = ['status', 'posted_date']

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Title cannot be empty.')
        return value

    def validate_required_skills(self, value):
        """Each skill is either a name or {"name": "...", "weight": 0.8}."""
        if not isinstance(value, list):
            raise serializers.ValidationError('required_skills must be a list.')
        for skill in value:
            if isinstance(skill, str):
                name = skill
            elif isinstance(skill, dict):
                name = skill.get('name')
                weight = skill.get('weight')
                if weight is not None:
                    try:
                        w = float(weight)
                    except (TypeError, ValueError):
                        raise serializers.ValidationError('Skill weight must be a number.')
                    if not 0 <= w <= 1:
                        raise serializers.ValidationError('Skill weight must be between 0 and 1.')
            else:
                raise serializers.ValidationError('Each skill must be a name or an object with a name.')
            if not isinstance(name, str) or not name.strip():
                raise serializers.ValidationError('Every skill needs a non-empty name.')
        return value


class ApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.user.name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'candidate', 'candidate_name', 'job', 'job_title',
            'match_score', 'recruitment_stage', 'interview_date',
            'rejection_reason', 'applied_date'
        ]
        read_only_fields = ['candidate', 'match_score', 'applied_date']