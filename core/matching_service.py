from .ai_bridge import get_match_and_gap
from .models import Candidate, Job, JobMatch


def _names(skills):
    out = []
    for s in skills or []:
        name = s.get('name') if isinstance(s, dict) else s
        if name and str(name).strip():
            out.append(str(name).strip())
    return out


def match_candidate_to_job(candidate, job):
    """Score one candidate against one job and save/update the JobMatch row."""
    result = get_match_and_gap(
        candidate_skills=_names(candidate.extracted_skills),
        candidate_experience=float(candidate.experience_years),
        candidate_education=candidate.education,
        job_skills=_names(job.required_skills),
    )
    match, _ = JobMatch.objects.update_or_create(
        job=job,
        candidate=candidate,
        defaults={
            'match_score': result['overall_score'],
            'matched_skills': result['matched_skills'],
            'missing_skills': result['missing_skills'],
        },
    )
    return match


def run_bulk_match(job):
    """Called when a job goes live: score ALL candidates that have a parsed CV."""
    count = 0
    for candidate in Candidate.objects.select_related('user').exclude(extracted_skills=[]):
        try:
            match_candidate_to_job(candidate, job)
            count += 1
        except Exception:
            continue  # one bad profile must not stop the whole run
    return count


def match_candidate_to_live_jobs(candidate):
    """Called after a CV upload: refresh this candidate against all approved jobs."""
    for job in Job.objects.filter(status='approved'):
        try:
            match_candidate_to_job(candidate, job)
        except Exception:
            continue