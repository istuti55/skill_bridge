from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserRegisterSerializer, UserSerializer
import fitz  # PyMuPDF
from .ai_service import extract_cv_data


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password_hash):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Candidate
import os
from django.conf import settings


class CVUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('cv_file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith('.pdf'):
            return Response({'error': 'Only PDF files are allowed'}, status=status.HTTP_400_BAD_REQUEST)

        # Save file to media/cvs/
        save_dir = os.path.join(settings.MEDIA_ROOT, 'cvs')
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, file.name)

        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        # Update the candidate's profile with the file path
        candidate = Candidate.objects.get(user=request.user)
        candidate.cv_file_path = f'media/cvs/{file.name}'
        candidate.save()
        # Extract text from PDF
        doc = fitz.open(file_path)
        resume_text = ""
        for page in doc:
            resume_text += page.get_text()
        doc.close()

        # Send to Ollama for structured extraction
        ai_result = extract_cv_data(resume_text)

        candidate.extracted_skills = ai_result.get('skills', [])
        candidate.education = ai_result.get('education', [])
        candidate.experience_years = ai_result.get('experience_years', 0)
        candidate.save()

        return Response({
            'message': 'CV uploaded successfully',
            'cv_file_path': candidate.cv_file_path
        }, status=status.HTTP_200_OK)
    
from .models import Job, Company, Application
from .serializers import JobSerializer, ApplicationSerializer
from rest_framework import permissions


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(status='approved').order_by('-posted_date')

    def perform_create(self, serializer):
        company = Company.objects.get(user=self.request.user)
        serializer.save(company=company)


class JobApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['approved', 'rejected']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        job.status = new_status
        job.save()
        return Response(JobSerializer(job).data)


class ApplyToJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, status='approved')
        except Job.DoesNotExist:
            return Response({'error': 'Job not found or not approved'}, status=status.HTTP_404_NOT_FOUND)

        candidate = Candidate.objects.get(user=request.user)

        if Application.objects.filter(candidate=candidate, job=job).exists():
            return Response({'error': 'You already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)

        application = Application.objects.create(candidate=candidate, job=job, match_score=0)
        return Response(ApplicationSerializer(application).data, status=status.HTTP_201_CREATED)


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        candidate = Candidate.objects.get(user=self.request.user)
        return Application.objects.filter(candidate=candidate).order_by('-applied_date')


class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs['pk']
        return Application.objects.filter(job_id=job_id).order_by('-match_score')


class UpdateApplicationStageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            application = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

        new_stage = request.data.get('recruitment_stage')
        valid_stages = [choice[0] for choice in Application.STAGE_CHOICES]
        if new_stage not in valid_stages:
            return Response({'error': 'Invalid stage'}, status=status.HTTP_400_BAD_REQUEST)

        application.recruitment_stage = new_stage
        if request.data.get('interview_date'):
            application.interview_date = request.data.get('interview_date')
        if request.data.get('rejection_reason'):
            application.rejection_reason = request.data.get('rejection_reason')
        application.save()

        return Response(ApplicationSerializer(application).data)