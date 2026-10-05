from django.contrib import admin

from .models import User, Candidate, Company, Job, Application, SkillGap, Notification, JobMatch


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active')
    search_fields = ('email', 'name')
    readonly_fields = ('password', 'last_login', 'date_joined')
    exclude = ('groups', 'user_permissions')

    def has_add_permission(self, request):
        # Users are created through /api/register/ so passwords get hashed
        return False


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('user', 'experience_years', 'resume_score', 'updated_at')
    search_fields = ('user__email', 'user__name')


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'industry', 'approved')
    list_filter = ('approved',)
    list_editable = ('approved',)
    search_fields = ('company_name',)


@admin.action(description='Approve selected jobs')
def approve_jobs(modeladmin, request, queryset):
    from .matching_service import run_bulk_match
    for job in queryset:
        job.status = 'approved'
        job.save()
        run_bulk_match(job)


@admin.action(description='Reject selected jobs')
def reject_jobs(modeladmin, request, queryset):
    queryset.update(status='rejected')


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'status', 'posted_date')
    list_filter = ('status',)
    search_fields = ('title', 'company__company_name')
    actions = [approve_jobs, reject_jobs]


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job', 'match_score', 'recruitment_stage', 'applied_date')
    list_filter = ('recruitment_stage',)


@admin.register(SkillGap)
class SkillGapAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job', 'skill_name', 'status')
    list_filter = ('status',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read',)


@admin.register(JobMatch)
class JobMatchAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job', 'match_score', 'updated_at')