import os
import uuid

import pymupdf as fitz  # PyMuPDF
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Candidate, Job, Application, SkillGap, Notification, JobMatch
from .serializers import UserRegisterSerializer, UserSerializer, JobSerializer, ApplicationSerializer
from .ai_service import extract_cv_data, generate_gap_narrative, AIServiceError
from .ai_bridge import get_skill_gap, get_career_recommendation
from .analysis import gap_summary
from .matching_service import evaluate, run_bulk_match, match_candidate_to_live_jobs, _names
from .permissions import IsCandidate, IsCompany, IsAdmin
from .pipeline import transition_error, parse_interview_date
from .scoring import calculate_resume_score, resume_suggestions
from .resources import get_resource_links, estimate_weeks

MAX_CV_SIZE = 5 * 1024 * 1024  # 5 MB

STAGE_MESSAGES = {
    'shortlisted': 'You have been shortlisted for {job}.',
    'interview_scheduled': 'An interview has been scheduled for {job}.',
    'offer_extended': 'You have received an offer for {job}.',
    'hired': 'Congratulations! You have been hired for {job}.',
    'rejected': 'Your application for {job} was not successful.',
}


# ---------------- Auth ----------------

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

        if not user.check_password(password) or not user.is_active:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


# ---------------- Candidate: CV and profile ----------------

class CVUploadView(APIView):
    permission_classes = [IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('cv_file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.lower().endswith('.pdf'):
            return Response({'error': 'Only PDF files are allowed'}, status=status.HTTP_400_BAD_REQUEST)

        if file.size > MAX_CV_SIZE:
            return Response({'error': 'File is too large (max 5 MB)'}, status=status.HTTP_400_BAD_REQUEST)

        if file.read(5) != b'%PDF-':
            return Response({'error': 'This file is not a valid PDF'}, status=status.HTTP_400_BAD_REQUEST)
        file.seek(0)

        candidate = get_object_or_404(Candidate, user=request.user)

        save_dir = os.path.join(settings.MEDIA_ROOT, 'cvs')
        os.makedirs(save_dir, exist_ok=True)
        safe_name = f"{request.user.id}_{uuid.uuid4().hex}.pdf"
        full_path = os.path.join(save_dir, safe_name)

        with open(full_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        try:
            doc = fitz.open(full_path)
            resume_text = "".join(page.get_text() for page in doc)
            doc.close()
        except Exception:
            os.remove(full_path)
            return Response({'error': 'Could not read this PDF'}, status=status.HTTP_400_BAD_REQUEST)

        if not resume_text.strip():
            os.remove(full_path)
            return Response(
                {'error': 'No text found in this PDF (scanned images are not supported)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ai_result = extract_cv_data(resume_text)
        except AIServiceError as e:
            os.remove(full_path)
            return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        skills = ai_result.get('skills', [])
        education = ai_result.get('education', [])
        try:
            experience = float(ai_result.get('experience_years', 0))
        except (TypeError, ValueError):
            experience = 0

        skills = skills if isinstance(skills, list) else []
        education = education if isinstance(education, list) else []
        experience = max(0, min(experience, 99.9))

        candidate.cv_file_path = f"cvs/{safe_name}"
        candidate.extracted_skills = skills
        candidate.education = education
        candidate.experience_years = experience
        candidate.resume_score = calculate_resume_score(skills, education, experience, has_cv=True)
        candidate.save()

        # Refresh this candidate's scores against every live job
        match_candidate_to_live_jobs(candidate)

        return Response({
            'message': 'CV uploaded successfully',
            'cv_file_path': f"{settings.MEDIA_URL}{candidate.cv_file_path}",
            'resume_score': candidate.resume_score,
            'suggestions': resume_suggestions(skills, education, experience, has_cv=True),
        }, status=status.HTTP_200_OK)


class MyProfileView(APIView):
    permission_classes = [IsCandidate]

    def get(self, request):
        candidate = get_object_or_404(Candidate, user=request.user)

        if candidate.resume_score is None and candidate.extracted_skills:
            candidate.resume_score = calculate_resume_score(
                candidate.extracted_skills,
                candidate.education,
                candidate.experience_years,
                has_cv=bool(candidate.cv_file_path),
            )
            candidate.save()

        cv_path = candidate.cv_file_path
        return Response({
            'cv_file_path': f"{settings.MEDIA_URL}{cv_path}" if cv_path else '',
            'extracted_skills': candidate.extracted_skills,
            'education': candidate.education,
            'experience_years': float(candidate.experience_years),
            'resume_score': candidate.resume_score,
            'suggestions': resume_suggestions(
                candidate.extracted_skills, candidate.education,
                candidate.experience_years, has_cv=bool(cv_path)),
        })


# ---------------- Jobs: admin approval ----------------
# (listing / creating / editing jobs lives in company_views.py)

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

        # Job is live: automatically match all registered candidates
        matched = run_bulk_match(job) if new_status == 'approved' else 0

        data = JobSerializer(job).data
        data['candidates_matched'] = matched
        return Response(data)


# ---------------- Applications and pipeline ----------------

class ApplyToJobView(APIView):
    permission_classes = [IsCandidate]

    def post(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, status='approved')
        except Job.DoesNotExist:
            return Response({'error': 'Job not found or not approved'}, status=status.HTTP_404_NOT_FOUND)

        candidate = get_object_or_404(Candidate, user=request.user)

        if Application.objects.filter(candidate=candidate, job=job).exists():
            return Response({'error': 'You already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)

        result, _ = evaluate(candidate, job)

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
        candidate = get_object_or_404(Candidate, user=self.request.user)
        return Application.objects.filter(candidate=candidate).order_by('-applied_date')


class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsCompany]

    def get_queryset(self):
        return Application.objects.filter(
            job_id=self.kwargs['pk'],
            job__company__user=self.request.user
        ).order_by('-match_score')


class UpdateApplicationStageView(APIView):
    permission_classes = [IsCompany]

    def patch(self, request, pk):
        try:
            application = Application.objects.select_related('job').get(
                pk=pk, job__company__user=request.user)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

        new_stage = request.data.get('recruitment_stage')
        valid_stages = [choice[0] for choice in Application.STAGE_CHOICES]
        if new_stage not in valid_stages:
            return Response({'error': 'Invalid stage'}, status=status.HTTP_400_BAD_REQUEST)

        old_stage = application.recruitment_stage
        error = transition_error(old_stage, new_stage)
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        raw_date = request.data.get('interview_date')
        if raw_date:
            interview_date = parse_interview_date(raw_date)
            if interview_date is None:
                return Response(
                    {'error': 'interview_date must look like 2026-10-20T10:30:00Z'},
                    status=status.HTTP_400_BAD_REQUEST)
            application.interview_date = interview_date

        application.recruitment_stage = new_stage
        if new_stage == 'rejected' and request.data.get('rejection_reason'):
            application.rejection_reason = str(request.data.get('rejection_reason'))[:255]
        application.save()

        if new_stage != old_stage and new_stage in STAGE_MESSAGES:
            Notification.objects.create(
                user=application.candidate.user,
                message=STAGE_MESSAGES[new_stage].format(job=application.job.title),
            )

        return Response(ApplicationSerializer(application).data)


# ---------------- Matching, ranking, skill gap, career path ----------------

class JobMatchView(APIView):
    permission_classes = [IsCandidate]

    def get(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, status='approved')
        except Job.DoesNotExist:
            return Response({'error': 'Job not found or not approved'}, status=status.HTTP_404_NOT_FOUND)

        candidate = get_object_or_404(Candidate, user=request.user)
        result, breakdown = evaluate(candidate, job)

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
            job = Job.objects.get(pk=pk, company__user=request.user)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        applications = {a.candidate_id: a for a in Application.objects.filter(job=job)}
        matches = (
            JobMatch.objects
            .filter(job=job)
            .select_related('candidate__user')
            .order_by('-match_score')
        )

        results = []
        for m in matches:
            app = applications.get(m.candidate_id)
            results.append({
                'candidate_id': m.candidate_id,
                'name': m.candidate.user.name,
                'match_score': float(m.match_score),
                'matched_skills': m.matched_skills,
                'missing_skills': m.missing_skills,
                'applied': app is not None,
                'application_id': app.id if app else None,
                'recruitment_stage': app.recruitment_stage if app else None,
            })
        return Response(results)


class SkillGapView(APIView):
    """
    GET /api/skill-gaps/?job_id=5               -> list (strong / weak / missing)
    GET /api/skill-gaps/?job_id=5&narrative=true -> {"summary", "summary_source", "skills"}
    """
    permission_classes = [IsCandidate]

    def get(self, request):
        job_id = request.query_params.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(pk=job_id, status='approved')
        except (Job.DoesNotExist, ValueError):
            return Response({'error': 'Job not found or not approved'}, status=status.HTTP_404_NOT_FOUND)

        candidate = get_object_or_404(Candidate, user=request.user)
        _, breakdown = evaluate(candidate, job)

        report = []
        for row in breakdown:
            name = row['skill']
            links = get_resource_links(name) if row['status'] in ('weak', 'missing') else []
            SkillGap.objects.update_or_create(
                candidate=candidate,
                job=job,
                skill_name=name,
                defaults={'status': row['status'], 'resource_links': links},
            )
            report.append({
                'skill_name': name,
                'status': row['status'],
                'resource_links': links,
            })

        if request.query_params.get('narrative', '').lower() != 'true':
            return Response(report)

        strong = [r['skill'] for r in breakdown if r['status'] == 'strong']
        weak = [r['skill'] for r in breakdown if r['status'] == 'weak']
        missing = [r['skill'] for r in breakdown if r['status'] == 'missing']
        try:
            summary = generate_gap_narrative(job.title, strong, weak, missing)
            source = 'ai'
        except AIServiceError:
            summary = gap_summary(job.title, breakdown)
            source = 'rules'

        return Response({'summary': summary, 'summary_source': source, 'skills': report})


class CareerPathView(APIView):
    permission_classes = [IsCandidate]

    def get(self, request):
        candidate = get_object_or_404(Candidate, user=request.user)

        skill_names = _names(candidate.extracted_skills)
        if not skill_names:
            return Response(
                {'error': 'Upload your CV first so we can read your skills'},
                status=status.HTTP_400_BAD_REQUEST
            )

        missing = []
        job_id = request.query_params.get('job_id')
        if job_id:
            try:
                job = Job.objects.get(pk=job_id, status='approved')
                missing = get_skill_gap(skill_names, _names(job.required_skills))['missing_skills']
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
                'est_weeks': estimate_weeks(name),
                'resources': get_resource_links(name),
            })

        return Response({
            'suggestions': suggestions,
            'roadmap': roadmap,
            'learning_path': ai.get('learning_path', []),
        })


# ---------------- Notifications ----------------

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