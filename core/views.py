from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
import os
import pymupdf as fitz  # PyMuPDF

from .models import User, Candidate, Company, Job, Application, SkillGap , Notification
from .serializers import UserRegisterSerializer, UserSerializer, JobSerializer, ApplicationSerializer
from .ai_service import extract_cv_data
from .ai_bridge import get_match_and_gap, get_skill_gap, get_career_recommendation
from .permissions import IsCandidate, IsCompany, IsAdmin


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

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


class CVUploadView(APIView):
    permission_classes = [IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('cv_file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith('.pdf'):
            return Response({'error': 'Only PDF files are allowed'}, status=status.HTTP_400_BAD_REQUEST)

        save_dir = os.path.join(settings.MEDIA_ROOT, 'cvs')
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, file.name)

        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        candidate = Candidate.objects.get(user=request.user)
        candidate.cv_file_path = file_path
        candidate.save()

        doc = fitz.open(file_path)
        resume_text = ""
        for page in doc:
            resume_text += page.get_text()
        doc.close()

        ai_result = extract_cv_data(resume_text)

        candidate.extracted_skills = ai_result.get('skills', [])
        candidate.education = ai_result.get('education', [])
        candidate.experience_years = ai_result.get('experience_years', 0)
        candidate.save()

        return Response({
            'message': 'CV uploaded successfully',
            'cv_file_path': candidate.cv_file_path
        }, status=status.HTTP_200_OK)


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer

    def get_permissions(self):
        # Anyone logged in can look at jobs, but only a company can post one
        if self.request.method == 'POST':
            return [IsCompany()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Job.objects.all().order_by('-posted_date')
        if user.role == 'company':
            return Job.objects.filter(company__user=user).order_by('-posted_date')
        return Job.objects.filter(status='approved').order_by('-posted_date')

    def perform_create(self, serializer):
        company = Company.objects.get(user=self.request.user)
        serializer.save(company=company)


class JobApproveView(APIView):
    permission_classes = [IsAdmin]

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
    permission_classes = [IsCandidate]

    def post(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, status='approved')
        except Job.DoesNotExist:
            return Response({'error': 'Job not found or not approved'}, status=status.HTTP_404_NOT_FOUND)

        candidate = Candidate.objects.get(user=request.user)

        if Application.objects.filter(candidate=candidate, job=job).exists():
            return Response({'error': 'You already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)

        candidate_skill_names = [
            s.get('name') if isinstance(s, dict) else s
            for s in candidate.extracted_skills
        ]
        job_skill_names = [
            s.get('name') if isinstance(s, dict) else s
            for s in job.required_skills
        ]

        result = get_match_and_gap(
            candidate_skills=candidate_skill_names,
            candidate_experience=float(candidate.experience_years),
            candidate_education=candidate.education,
            job_skills=job_skill_names,
        )

        application = Application.objects.create(
            candidate=candidate,
            job=job,
            match_score=result['overall_score']
        )

        return Response({
            **ApplicationSerializer(application).data,
            'match_breakdown': result['breakdown'],
            'missing_skills': result['missing_skills']
        }, status=status.HTTP_201_CREATED)


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsCandidate]

    def get_queryset(self):
        candidate = Candidate.objects.get(user=self.request.user)
        return Application.objects.filter(candidate=candidate).order_by('-applied_date')


class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsCompany]

    def get_queryset(self):
        # Only applicants of THIS company's own job
        return Application.objects.filter(
            job_id=self.kwargs['pk'],
            job__company__user=self.request.user
        ).order_by('-match_score')


class UpdateApplicationStageView(APIView):
    permission_classes = [IsCompany]

    def patch(self, request, pk):
        try:
            # Only applications that belong to this company's own jobs
            application = Application.objects.get(pk=pk, job__company__user=request.user)
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

class MyProfileView(APIView):
    permission_classes = [IsCandidate]

    def get(self, request):
        candidate = Candidate.objects.get(user=request.user)
        return Response({
            'cv_file_path': candidate.cv_file_path,
            'extracted_skills': candidate.extracted_skills,
            'education': candidate.education,
            'experience_years': float(candidate.experience_years),
            'resume_score': candidate.resume_score,
        })


class JobMatchView(APIView):
    permission_classes = [IsCandidate]

    def get(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, status='approved')
        except Job.DoesNotExist:
            return Response({'error': 'Job not found or not approved'}, status=status.HTTP_404_NOT_FOUND)

        candidate = Candidate.objects.get(user=request.user)

        candidate_skill_names = [
            s.get('name') if isinstance(s, dict) else s
            for s in candidate.extracted_skills
        ]
        job_skill_names = [
            s.get('name') if isinstance(s, dict) else s
            for s in job.required_skills
        ]

        result = get_match_and_gap(
            candidate_skills=candidate_skill_names,
            candidate_experience=float(candidate.experience_years),
            candidate_education=candidate.education,
            job_skills=job_skill_names,
        )

        matched = {m.lower().strip() for m in result['matched_skills']}

        breakdown = []
        for skill in job.required_skills:
            name = skill.get('name') if isinstance(skill, dict) else skill
            weight = skill.get('weight') if isinstance(skill, dict) else None
            has_skill = bool(name) and name.lower().strip() in matched
            breakdown.append({
                'skill': name,
                'candidate_has': has_skill,
                'weight': weight,
                'status': 'strong' if has_skill else 'missing',
            })

        return Response({
            'job_id': job.id,
            'match_score': result['overall_score'],
            'breakdown': breakdown,
            'scores': result['breakdown'],
        })

class RankedCandidatesView(APIView):
    permission_classes = [IsCompany]

    def get(self, request, pk):
        try:
            # Only the company's own job
            job = Job.objects.get(pk=pk, company__user=request.user)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        applications = (
            Application.objects
            .filter(job=job)
            .select_related('candidate__user')
            .order_by('-match_score')
        )

        return Response([
            {
                'candidate_id': app.candidate.id,
                'name': app.candidate.user.name,
                'match_score': float(app.match_score),
                'recruitment_stage': app.recruitment_stage,
            }
            for app in applications
        ])
class SkillGapView(APIView):
    permission_classes = [IsCandidate]

    def get(self, request):
        job_id = request.query_params.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(pk=job_id, status='approved')
        except (Job.DoesNotExist, ValueError):
            return Response({'error': 'Job not found or not approved'}, status=status.HTTP_404_NOT_FOUND)

        candidate = Candidate.objects.get(user=request.user)

        candidate_skill_names = [
            s.get('name') if isinstance(s, dict) else s
            for s in candidate.extracted_skills
        ]
        job_skill_names = [
            s.get('name') if isinstance(s, dict) else s
            for s in job.required_skills
        ]

        gap = get_skill_gap(candidate_skill_names, job_skill_names)
        matched = set(gap['matched_skills'])

        report = []
        for name in job_skill_names:
            if not name:
                continue
            skill_status = 'strong' if name.lower().strip() in matched else 'missing'
            record, _ = SkillGap.objects.update_or_create(
                candidate=candidate,
                job=job,
                skill_name=name,
                defaults={'status': skill_status},
            )
            report.append({
                'skill_name': name,
                'status': skill_status,
                'resource_links': record.resource_links,
            })

        return Response(report)
class CareerPathView(APIView):
    permission_classes = [IsCandidate]

    def get(self, request):
        candidate = Candidate.objects.get(user=request.user)

        skill_names = [
            s.get('name') if isinstance(s, dict) else s
            for s in candidate.extracted_skills
        ]
        if not skill_names:
            return Response(
                {'error': 'Upload your CV first so we can read your skills'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Optional: pass ?job_id=1 to include the skills missing for that job
        missing = []
        job_id = request.query_params.get('job_id')
        if job_id:
            try:
                job = Job.objects.get(pk=job_id, status='approved')
                job_skill_names = [
                    s.get('name') if isinstance(s, dict) else s
                    for s in job.required_skills
                ]
                missing = get_skill_gap(skill_names, job_skill_names)['missing_skills']
            except (Job.DoesNotExist, ValueError):
                pass

        try:
            ai = get_career_recommendation(
                skill_names,
                float(candidate.experience_years),
                candidate.education,
                missing,
            )
        except Exception:
            return Response(
                {'error': 'The AI service is not available. Make sure Ollama is running.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        reason = ai.get('reason', '')

        suggestions = []
        for role in ai.get('recommended_roles', []):
            if isinstance(role, dict):
                title = role.get('title') or role.get('name') or role.get('role') or str(role)
                role_reason = role.get('reason') or role.get('description') or reason
                suggestions.append({'title': title, 'reason': role_reason})
            else:
                suggestions.append({'title': str(role), 'reason': reason})

        roadmap = []
        for i, item in enumerate(ai.get('skill_priorities', []), start=1):
            if isinstance(item, dict):
                name = item.get('skill') or item.get('name') or str(item)
            else:
                name = str(item)
            roadmap.append({
                'skill': name,
                'priority': i,
                'est_weeks': None,   # the AI does not give this yet
                'resources': [],     # the AI does not give this yet
            })

        return Response({
            'suggestions': suggestions,
            'roadmap': roadmap,
            'learning_path': ai.get('learning_path', []),
        })


def get_career_recommendation(candidate_skills, experience, education, missing_skills):
    # Imported here so the server still starts even if Ollama is not ready
    from intelligence.recommender import generate_career_recommendation
    return generate_career_recommendation(
        candidate_skills, experience, education, missing_skills
    )
STAGE_MESSAGES = {
    'shortlisted': 'You have been shortlisted for {job}.',
    'interview_scheduled': 'An interview has been scheduled for {job}.',
    'offer_extended': 'You have received an offer for {job}.',
    'hired': 'Congratulations! You have been hired for {job}.',
    'rejected': 'Your application for {job} was not successful.',
}


class UpdateApplicationStageView(APIView):
    permission_classes = [IsCompany]

    def patch(self, request, pk):
        try:
            application = Application.objects.get(pk=pk, job__company__user=request.user)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

        new_stage = request.data.get('recruitment_stage')
        valid_stages = [choice[0] for choice in Application.STAGE_CHOICES]
        if new_stage not in valid_stages:
            return Response({'error': 'Invalid stage'}, status=status.HTTP_400_BAD_REQUEST)

        old_stage = application.recruitment_stage
        application.recruitment_stage = new_stage
        if request.data.get('interview_date'):
            application.interview_date = request.data.get('interview_date')
        if request.data.get('rejection_reason'):
            application.rejection_reason = request.data.get('rejection_reason')
        application.save()

        # Tell the candidate, but only when the stage really changed
        if new_stage != old_stage and new_stage in STAGE_MESSAGES:
            Notification.objects.create(
                user=application.candidate.user,
                message=STAGE_MESSAGES[new_stage].format(job=application.job.title),
            )

        return Response(ApplicationSerializer(application).data)
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notes = Notification.objects.filter(user=request.user).order_by('-created_at')
        return Response([
            {
                'id': n.id,
                'message': n.message,
                'is_read': n.is_read,
                'created_at': n.created_at,
            }
            for n in notes
        ])


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            note = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

        note.is_read = True
        note.save()
        return Response({'id': note.id, 'is_read': True})