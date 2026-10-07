from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User, Company, Job, Application, Candidate
from .permissions import IsAdmin


class AdminStatsView(APIView):
    """GET /api/admin/stats/  -> numbers for the admin overview cards."""
    permission_classes = [IsAdmin]

    def get(self, request):
        users_by_role = {
            row['role']: row['n']
            for row in User.objects.values('role').annotate(n=Count('id'))
        }
        jobs_by_status = {
            row['status']: row['n']
            for row in Job.objects.values('status').annotate(n=Count('id'))
        }
        stage_counts = {
            row['recruitment_stage']: row['n']
            for row in Application.objects.values('recruitment_stage').annotate(n=Count('id'))
        }

        return Response({
            'users': {
                'total': User.objects.count(),
                'candidates': users_by_role.get('candidate', 0),
                'companies': users_by_role.get('company', 0),
                'admins': users_by_role.get('admin', 0),
                'inactive': User.objects.filter(is_active=False).count(),
            },
            'companies': {
                'approved': Company.objects.filter(approved=True).count(),
                'pending': Company.objects.filter(approved=False).count(),
            },
            'jobs': {
                'total': Job.objects.count(),
                'pending': jobs_by_status.get('pending', 0),
                'approved': jobs_by_status.get('approved', 0),
                'rejected': jobs_by_status.get('rejected', 0),
                'closed': jobs_by_status.get('closed', 0),
            },
            'applications': {
                'total': Application.objects.count(),
                'by_stage': stage_counts,
            },
        })


class AdminUserListView(APIView):
    """GET /api/admin/users/?role=candidate|company|admin&q=text"""
    permission_classes = [IsAdmin]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')

        role = request.query_params.get('role')
        if role in ('candidate', 'company', 'admin'):
            users = users.filter(role=role)

        q = (request.query_params.get('q') or '').strip()
        if q:
            users = users.filter(Q(name__icontains=q) | Q(email__icontains=q))

        company_names = {
            c.user_id: c.company_name
            for c in Company.objects.filter(user__in=users)
        }

        candidates = {
            c.user_id: c
            for c in Candidate.objects.filter(user__in=users)
                .annotate(app_count=Count('applications'))
        }

        data = []
        for u in users[:500]:
            c = candidates.get(u.id)
            skills = c.extracted_skills if c and isinstance(c.extracted_skills, list) else []
            data.append({
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'role': u.role,
                'is_active': u.is_active,
                'date_joined': u.date_joined,
                'company_name': company_names.get(u.id),
                # candidate details (used by the admin Candidates tab)
                'has_cv': bool(c and c.cv_file_path),
                'skills': [str(sk) for sk in skills],
                'experience_years': float(c.experience_years) if c else 0,
                'resume_score': c.resume_score if c else None,
                'applications_count': c.app_count if c else 0,
            })
        return Response(data)


class AdminUserDetailView(APIView):
    """PATCH /api/admin/users/<id>/  body: {"is_active": true|false}"""
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        is_active = request.data.get('is_active')
        if not isinstance(is_active, bool):
            return Response({'error': '"is_active" must be true or false'},
                            status=status.HTTP_400_BAD_REQUEST)

        if user.id == request.user.id:
            return Response({'error': 'You cannot deactivate your own account'},
                            status=status.HTTP_400_BAD_REQUEST)
        if user.role == 'admin':
            return Response({'error': 'Admin accounts cannot be changed here'},
                            status=status.HTTP_403_FORBIDDEN)

        user.is_active = is_active
        user.save(update_fields=['is_active'])

        return Response({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
        })