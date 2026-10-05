"""Dashboards, candidate comparison report, and the company's match explanation."""
from django.db.models import Avg, Count
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .matching_service import evaluate
from .models import Application, Candidate, Company, Job, JobMatch, Notification
from .permissions import IsCandidate, IsCompany


class CandidateDashboardView(APIView):
    permission_classes = [IsCandidate]

    def get(self, request):
        candidate = get_object_or_404(Candidate, user=request.user)

        matches = (
            JobMatch.objects.filter(candidate=candidate, job__status='approved')
            .select_related('job__company')
            .order_by('-match_score')
        )
        top_matches = [
            {
                'job_id': m.job_id,
                'title': m.job.title,
                'company': m.job.company.company_name,
                'match_score': float(m.match_score),
                'missing_skills': m.missing_skills,
            }
            for m in matches[:5]
        ]

        best = [float(m.match_score) for m in matches[:3]]
        readiness = round(sum(best) / len(best), 1) if best else 0

        skills = candidate.extracted_skills or []
        strong = sum(
            1 for s in skills
            if isinstance(s, dict) and str(s.get('level', '')).lower() == 'strong'
        )

        apps = Application.objects.filter(candidate=candidate)
        stage_counts = {row['recruitment_stage']: row['n'] for row in
                        apps.values('recruitment_stage').annotate(n=Count('id'))}

        return Response({
            'resume_score': candidate.resume_score,
            'job_readiness': readiness,
            'skills_total': len(skills),
            'skills_strong': strong,
            'matched_jobs_count': matches.count(),
            'top_matches': top_matches,
            'applications_total': apps.count(),
            'applications_by_stage': stage_counts,
            'unread_notifications': Notification.objects.filter(
                user=request.user, is_read=False).count(),
        })


class CompanyDashboardView(APIView):
    permission_classes = [IsCompany]

    def get(self, request):
        company = get_object_or_404(Company, user=request.user)
        jobs = Job.objects.filter(company=company)
        apps = Application.objects.filter(job__company=company)

        stage_counts = {row['recruitment_stage']: row['n'] for row in
                        apps.values('recruitment_stage').annotate(n=Count('id'))}
        for stage, _ in Application.STAGE_CHOICES:
            stage_counts.setdefault(stage, 0)

        job_status = {row['status']: row['n'] for row in
                      jobs.values('status').annotate(n=Count('id'))}

        top = apps.select_related('candidate__user', 'job').order_by('-match_score')[:5]

        per_job = [
            {
                'job_id': j.id,
                'title': j.title,
                'status': j.status,
                'applicants': j.applications.count(),
                'avg_match_score': round(float(
                    j.applications.aggregate(a=Avg('match_score'))['a'] or 0), 1),
            }
            for j in jobs.order_by('-posted_date')
        ]

        return Response({
            'company_approved': company.approved,
            'jobs_total': jobs.count(),
            'jobs_by_status': job_status,
            'applications_total': apps.count(),
            'pipeline': stage_counts,
            'top_candidates': [
                {
                    'application_id': a.id,
                    'candidate_id': a.candidate_id,
                    'name': a.candidate.user.name,
                    'job': a.job.title,
                    'match_score': float(a.match_score),
                    'stage': a.recruitment_stage,
                }
                for a in top
            ],
            'jobs': per_job,
        })


class ApplicantMatchView(APIView):
    """GET /api/jobs/<job_id>/candidates/<candidate_id>/match/  (company view)"""
    permission_classes = [IsCompany]

    def get(self, request, pk, candidate_id):
        job = get_object_or_404(Job, pk=pk, company__user=request.user)
        candidate = get_object_or_404(Candidate.objects.select_related('user'), pk=candidate_id)

        result, breakdown = evaluate(candidate, job)
        app = Application.objects.filter(job=job, candidate=candidate).first()

        return Response({
            'job_id': job.id,
            'candidate_id': candidate.id,
            'name': candidate.user.name,
            'match_score': result['overall_score'],
            'breakdown': breakdown,
            'scores': result['breakdown'],
            'applied': app is not None,
            'recruitment_stage': app.recruitment_stage if app else None,
        })


class CompareCandidatesView(APIView):
    """
    GET /api/jobs/<id>/compare/?candidate_ids=1,2,3
    Add &export=pdf to download a PDF. (Do not use ?format=pdf, DRF reserves "format".)
    """
    permission_classes = [IsCompany]

    def get(self, request, pk):
        from .reports import build_comparison, render_pdf, MAX_COMPARE

        try:
            job = Job.objects.select_related('company').get(pk=pk, company__user=request.user)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        raw = request.query_params.get('candidate_ids', '')
        try:
            ids = [int(x) for x in raw.split(',') if x.strip()]
        except ValueError:
            return Response({'error': 'candidate_ids must be numbers like 1,2,3'},
                            status=status.HTTP_400_BAD_REQUEST)

        ids = list(dict.fromkeys(ids))
        if len(ids) < 2 or len(ids) > MAX_COMPARE:
            return Response({'error': f'Choose between 2 and {MAX_COMPARE} candidates'},
                            status=status.HTTP_400_BAD_REQUEST)

        candidates = list(Candidate.objects.filter(id__in=ids).select_related('user'))
        if len(candidates) != len(ids):
            return Response({'error': 'One or more candidates were not found'},
                            status=status.HTTP_404_NOT_FOUND)

        applications = {a.candidate_id: a for a in Application.objects.filter(job=job)}
        data = build_comparison(job, candidates, applications)

        if request.query_params.get('export') == 'pdf':
            response = HttpResponse(render_pdf(data), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="comparison_job_{job.id}.pdf"'
            return response

        return Response(data)