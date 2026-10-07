import re

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User, Candidate, Company, Job, Application


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'role']

    def to_internal_value(self, data):
        # The React form sends "fullName" and no role: accept that too.
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if not data.get('name') and data.get('fullName'):
            data['name'] = data['fullName']
        if not data.get('role'):
            data['role'] = 'candidate'
        return super().to_internal_value(data)

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
            Company.objects.create(user=user, company_name=user.name, approved=True)

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'date_joined']


class CVUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = ['cv_file_path']


class CandidateProfileSerializer(serializers.ModelSerializer):
    """
    Used by PATCH /api/candidates/me/.
    Edits the candidate's profile fields and the user's name/email together.
    """
    name = serializers.CharField(source='user.name', max_length=150, required=False)
    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = Candidate
        fields = ['name', 'email', 'phone', 'location', 'current_role', 'bio']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Name cannot be empty.')
        return value

    def validate_email(self, value):
        value = value.strip()
        # Email is the login identifier, so it must stay unique
        taken = User.objects.filter(email__iexact=value).exclude(
            pk=self.instance.user.pk
        )
        if taken.exists():
            raise serializers.ValidationError('This email is already in use.')
        return value

    def validate_phone(self, value):
        value = value.strip()
        if value and not re.fullmatch(r'[0-9+\-\s()]{7,20}', value):
            raise serializers.ValidationError('Enter a valid phone number.')
        return value

    def validate_bio(self, value):
        if len(value) > 1000:
            raise serializers.ValidationError('Bio must be 1000 characters or less.')
        return value

    def update(self, instance, validated_data):
        # name and email live on the User model, not on Candidate
        user_data = validated_data.pop('user', {})
        if user_data:
            for field, value in user_data.items():
                setattr(instance.user, field, value)
            instance.user.save()
        return super().update(instance, validated_data)


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
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    # Only filled in for logged-in candidates (None for companies/admins)
    match_score = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'required_skills', 'location',
            'salary_range', 'job_type', 'job_type_display', 'status',
            'posted_date', 'company_name', 'match_score', 'has_applied',
        ]
        read_only_fields = ['status', 'posted_date']

    def _candidate(self):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated or user.role != 'candidate':
            return None
        return getattr(user, 'candidate', None)

    def get_match_score(self, job):
        candidate = self._candidate()
        if candidate is None:
            return None
        # The view can pass a ready-made {job_id: score} map to avoid one query per job
        match_map = self.context.get('match_map')
        if match_map is not None:
            return match_map.get(job.id)
        from .models import JobMatch
        m = JobMatch.objects.filter(job=job, candidate=candidate).first()
        return float(m.match_score) if m else None

    def get_has_applied(self, job):
        candidate = self._candidate()
        if candidate is None:
            return None
        applied = self.context.get('applied_ids')
        if applied is not None:
            return job.id in applied
        return job.applications.filter(candidate=candidate).exists()

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
    candidate_user_id = serializers.IntegerField(source='candidate.user_id', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.company_name', read_only=True)
    company_user_id = serializers.IntegerField(source='job.company.user_id', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'candidate', 'candidate_name', 'candidate_user_id',
            'job', 'job_title', 'company_name', 'company_user_id',
            'match_score', 'recruitment_stage', 'interview_date',
            'rejection_reason', 'applied_date'
        ]
        read_only_fields = ['candidate', 'match_score', 'applied_date']