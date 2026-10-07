from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .matching_service import run_bulk_match
from .models import Company, Job, Notification
from .permissions import IsCompany, IsAdmin
from .serializers import CompanySerializer, JobSerializer


# ---------------------------------------------------------------
# Company profile (company side)
# ---------------------------------------------------------------

class CompanyProfileView(APIView):
    permission_classes = [IsCompany]

    def get(self, request):
        company = get_object_or_404(Company, user=request.user)
        return Response(CompanySerializer(company).data)

    def patch(self, request):
        company = get_object_or_404(Company, user=request.user)
        serializer = CompanySerializer(company, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ---------------------------------------------------------------
# Company approval (admin side)
# ---------------------------------------------------------------

class CompanyListView(generics.ListAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = Company.objects.select_related('user').order_by('id')
        approved = self.request.query_params.get('approved')
        if approved is not None:
            queryset = queryset.filter(approved=approved.lower() == 'true')
        return queryset


class CompanyApproveView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        company = get_object_or_404(Company, pk=pk)

        approved = request.data.get('approved')
        if not isinstance(approved, bool):
            return Response(
                {'error': '"approved" must be true or false'},
                status=status.HTTP_400_BAD_REQUEST
            )

        company.approved = approved
        company.save()

        message = (
            'Your company has been approved. You can now post jobs.'
            if approved else
            'Your company approval was removed. You can no longer post jobs.'
        )
        Notification.objects.create(user=company.user, message=message)

        return Response(CompanySerializer(company).data)


# ---------------------------------------------------------------
# Jobs: list + create
# New companies and new jobs go live right away.
# The admin only steps in when a company is flagged by bad reviews.
# ---------------------------------------------------------------

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
        # Candidates: only live jobs of companies that are not suspended
        return Job.objects.filter(
            status='approved', company__user__is_active=True
        ).order_by('-posted_date')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        user = self.request.user
        if user.is_authenticated and user.role == 'candidate' and hasattr(user, 'candidate'):
            from .models import JobMatch, Application
            cand = user.candidate
            ctx['match_map'] = {
                m.job_id: float(m.match_score)
                for m in JobMatch.objects.filter(candidate=cand)
            }
            ctx['applied_ids'] = set(
                Application.objects.filter(candidate=cand).values_list('job_id', flat=True)
            )
        return ctx

    def create(self, request, *args, **kwargs):
        company = get_object_or_404(Company, user=request.user)
        if not company.approved:
            return Response(
                {'error': 'Your company has not been approved by an admin yet.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        company = get_object_or_404(Company, user=self.request.user)
        job = serializer.save(company=company, status='approved')
        run_bulk_match(job)  # match all candidates right away


# ---------------------------------------------------------------
# Jobs: detail, edit, delete, close
# ---------------------------------------------------------------

class JobDetailView(APIView):
    """
    GET    /api/jobs/<id>/   anyone logged in (candidates only see approved jobs)
    PATCH  /api/jobs/<id>/   the company that owns the job
    DELETE /api/jobs/<id>/   the company that owns the job (only if nobody applied)
    """

    def get_permissions(self):
        return [IsAuthenticated()]

    def _visible_job(self, request, pk):
        user = request.user
        if user.role == 'admin':
            return get_object_or_404(Job, pk=pk)
        if user.role == 'company':
            return get_object_or_404(Job, pk=pk, company__user=user)
        return get_object_or_404(Job, pk=pk, status='approved')

    def _own_job(self, request, pk):
        if request.user.role != 'company':
            return None
        return get_object_or_404(Job, pk=pk, company__user=request.user)

    def get(self, request, pk):
        job = self._visible_job(request, pk)
        return Response(JobSerializer(job).data)

    def patch(self, request, pk):
        job = self._own_job(request, pk)
        if job is None:
            return Response({'error': 'Only the company that posted this job can edit it'},
                            status=status.HTTP_403_FORBIDDEN)

        if job.status == 'closed':
            return Response({'error': 'A closed job cannot be edited'},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = JobSerializer(job, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        job = serializer.save(status='approved')
        run_bulk_match(job)  # skills may have changed, so match again

        return Response(JobSerializer(job).data)

    def delete(self, request, pk):
        job = self._own_job(request, pk)
        if job is None:
            return Response({'error': 'Only the company that posted this job can delete it'},
                            status=status.HTTP_403_FORBIDDEN)

        if job.applications.exists():
            return Response(
                {'error': 'This job already has applications. Close it instead of deleting it.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class JobCloseView(APIView):
    permission_classes = [IsCompany]

    def patch(self, request, pk):
        job = get_object_or_404(Job, pk=pk, company__user=request.user)

        if job.status == 'closed':
            return Response({'error': 'This job is already closed'},
                            status=status.HTTP_400_BAD_REQUEST)

        job.status = 'closed'
        job.save()
        return Response(JobSerializer(job).data)