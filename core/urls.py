from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, CVUploadView,
    JobApproveView,
    ApplyToJobView, MyApplicationsView, JobApplicationsView, UpdateApplicationStageView,
    MyProfileView, JobMatchView, RankedCandidatesView, SkillGapView, CareerPathView,
    NotificationListView, NotificationReadView
)
from .company_views import (
    CompanyProfileView, CompanyListView, CompanyApproveView,
    JobListCreateView, JobDetailView, JobCloseView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('login/', LoginView.as_view(), name='login'),

    path('candidates/upload-cv/', CVUploadView.as_view(), name='upload-cv'),
    path('candidates/me/', MyProfileView.as_view(), name='my-profile'),
    path('candidates/career-paths/', CareerPathView.as_view(), name='career-paths'),

    path('companies/me/', CompanyProfileView.as_view(), name='company-profile'),
    path('companies/', CompanyListView.as_view(), name='company-list'),
    path('companies/<int:pk>/approve/', CompanyApproveView.as_view(), name='company-approve'),

    path('jobs/', JobListCreateView.as_view(), name='jobs'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:pk>/approve/', JobApproveView.as_view(), name='job-approve'),
    path('jobs/<int:pk>/close/', JobCloseView.as_view(), name='job-close'),
    path('jobs/<int:pk>/apply/', ApplyToJobView.as_view(), name='job-apply'),
    path('jobs/<int:pk>/match/', JobMatchView.as_view(), name='job-match'),
    path('jobs/<int:pk>/ranked-candidates/', RankedCandidatesView.as_view(), name='ranked-candidates'),
    path('jobs/<int:pk>/applications/', JobApplicationsView.as_view(), name='job-applications'),

    path('skill-gaps/', SkillGapView.as_view(), name='skill-gaps'),

    path('applications/mine/', MyApplicationsView.as_view(), name='my-applications'),
    path('applications/<int:pk>/', UpdateApplicationStageView.as_view(), name='update-application'),

    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
]