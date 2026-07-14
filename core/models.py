from django.db import models
from django.contrib.auth.hashers import make_password


class User(models.Model):
    ROLE_CHOICES = [
        ('candidate', 'Candidate'),
        ('company', 'Company'),
        ('admin', 'Admin'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=254, unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def __str__(self):
        return f"{self.name} ({self.role})"


class Candidate(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate')
    cv_file_path = models.CharField(max_length=500)
    extracted_skills = models.JSONField(default=list)
    education = models.JSONField(default=list)
    experience_years = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    resume_score = models.SmallIntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Candidate: {self.user.name}"


class Company(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company')
    company_name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100, null=True, blank=True)
    approved = models.BooleanField(default=False)

    def __str__(self):
        return self.company_name


class Job(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('closed', 'Closed'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    required_skills = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    posted_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} @ {self.company.company_name}"


class Application(models.Model):
    STAGE_CHOICES = [
        ('applied', 'Applied'),
        ('shortlisted', 'Shortlisted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('offer_extended', 'Offer Extended'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
    ]

    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    match_score = models.DecimalField(max_digits=5, decimal_places=2)
    recruitment_stage = models.CharField(max_length=25, choices=STAGE_CHOICES, default='applied')
    interview_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.CharField(max_length=255, null=True, blank=True)
    applied_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('candidate', 'job')  # a candidate can only apply once per job

    def __str__(self):
        return f"{self.candidate.user.name} -> {self.job.title} ({self.recruitment_stage})"


class SkillGap(models.Model):
    STATUS_CHOICES = [
        ('strong', 'Strong'),
        ('weak', 'Weak'),
        ('missing', 'Missing'),
    ]

    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='skill_gaps')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='skill_gaps')
    skill_name = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    resource_links = models.JSONField(default=list)

    def __str__(self):
        return f"{self.candidate.user.name} - {self.skill_name} ({self.status})"