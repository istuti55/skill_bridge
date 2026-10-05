from django.urls import path
from .views import (
    RegisterView, LoginView, CVUploadView,
    JobListCreateView, JobApproveView,
    ApplyToJobView, MyApplicationsView, JobApplicationsView, UpdateApplicationStageView,
    MyProfileView, JobMatchView, RankedCandidatesView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('candidates/upload-cv/', CVUploadView.as_view(), name='upload-cv'),
    path('candidates/me/', MyProfileView.as_view(), name='my-profile'),
    path('jobs/', JobListCreateView.as_view(), name='jobs'),
    path('jobs/<int:pk>/approve/', JobApproveView.as_view(), name='job-approve'),
    path('jobs/<int:pk>/apply/', ApplyToJobView.as_view(), name='job-apply'),
    path('jobs/<int:pk>/match/', JobMatchView.as_view(), name='job-match'),
    path('jobs/<int:pk>/ranked-candidates/', RankedCandidatesView.as_view(), name='ranked-candidates'),
    path('jobs/<int:pk>/applications/', JobApplicationsView.as_view(), name='job-applications'),
    path('applications/mine/', MyApplicationsView.as_view(), name='my-applications'),
    path('applications/<int:pk>/', UpdateApplicationStageView.as_view(), name='update-application'),
]