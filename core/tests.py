from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient, APITestCase

from .analysis import classify, gap_summary
from .models import (Application, Candidate, Company, Job, JobMatch,
                     Notification, User)
from .pipeline import transition_error
from .scoring import resume_suggestions

FAKE_RESULT = {
    'overall_score': 75.0,
    'matched_skills': ['django'],
    'missing_skills': ['postgresql'],
    'breakdown': {'skills_score': 75.0, 'experience_score': 50, 'education_score': 50,
                  'recommendation': 'Moderate Match'},
}


def make_user(email, role, **extra):
    user = User.objects.create_user(email=email, password='pass12345', name=email.split('@')[0],
                                    role=role, **extra)
    if role == 'candidate':
        Candidate.objects.create(
            user=user, cv_file_path='cvs/x.pdf',
            extracted_skills=[{'name': 'Django', 'level': 'strong'}],
            education=[{'degree': 'BE', 'year': 2026}], experience_years=1)
    elif role == 'company':
        Company.objects.create(user=user, company_name='Acme', approved=True)
    return user


class PureLogicTests(TestCase):
    def test_stage_rules(self):
        self.assertIsNone(transition_error('applied', 'shortlisted'))
        self.assertIsNotNone(transition_error('applied', 'hired'))
        self.assertIsNotNone(transition_error('hired', 'applied'))
        self.assertIsNotNone(transition_error('rejected', 'shortlisted'))
        self.assertIsNone(transition_error('offer_extended', 'rejected'))

    def test_classify_strong_weak_missing(self):
        skills = [{'name': 'Django', 'level': 'strong'}, {'name': 'SQL', 'level': 'beginner'}]
        required = [{'name': 'Django', 'weight': 0.8}, 'SQL', 'Docker', 'FastAPI']
        rows = classify(skills, required, matched_names={'django', 'sql', 'fastapi'})
        status = {r['skill']: r['status'] for r in rows}
        self.assertEqual(status, {'Django': 'strong', 'SQL': 'weak',
                                  'Docker': 'missing', 'FastAPI': 'weak'})

    def test_gap_summary_mentions_missing(self):
        rows = classify([], ['Docker'], set())
        self.assertIn('Docker', gap_summary('DevOps', rows))

    def test_resume_suggestions(self):
        tips = resume_suggestions([], [], 0, has_cv=True)
        areas = {t['area'] for t in tips}
        self.assertTrue({'Skills', 'Education', 'Experience'} <= areas)
        self.assertEqual(resume_suggestions([], [], 0, has_cv=False)[0]['area'], 'CV')


@patch('core.matching_service.get_match_and_gap', return_value=FAKE_RESULT)
class ApiTests(TestCase):
    def setUp(self):
        self.admin = make_user('admin@x.com', 'admin', is_staff=True)
        self.company_user = make_user('company@x.com', 'company')
        self.cand_user = make_user('cand@x.com', 'candidate')
        self.job = Job.objects.create(
            company=self.company_user.company, title='Backend Dev', status='pending',
            required_skills=[{'name': 'Django', 'weight': 0.8}, {'name': 'PostgreSQL', 'weight': 0.2}])

    def client_for(self, user):
        c = APIClient()
        c.force_authenticate(user)
        return c

    def test_unapproved_company_cannot_post_job(self, _):
        self.company_user.company.approved = False
        self.company_user.company.save()
        r = self.client_for(self.company_user).post(
            '/api/jobs/', {'title': 'X', 'required_skills': ['Django']}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_candidate_cannot_use_company_endpoint(self, _):
        r = self.client_for(self.cand_user).get(f'/api/jobs/{self.job.id}/ranked-candidates/')
        self.assertEqual(r.status_code, 403)

    def test_approval_runs_bulk_matching(self, _):
        r = self.client_for(self.admin).patch(
            f'/api/jobs/{self.job.id}/approve/', {'status': 'approved'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['candidates_matched'], 1)
        self.assertEqual(JobMatch.objects.filter(job=self.job).count(), 1)

        ranked = self.client_for(self.company_user).get(
            f'/api/jobs/{self.job.id}/ranked-candidates/')
        self.assertEqual(ranked.status_code, 200)
        self.assertEqual(ranked.data[0]['match_score'], 75.0)
        self.assertFalse(ranked.data[0]['applied'])

    def test_apply_once_and_pipeline_flow(self, _):
        self.job.status = 'approved'
        self.job.save()
        cand = self.client_for(self.cand_user)
        company = self.client_for(self.company_user)

        first = cand.post(f'/api/jobs/{self.job.id}/apply/')
        self.assertEqual(first.status_code, 201)
        self.assertEqual(cand.post(f'/api/jobs/{self.job.id}/apply/').status_code, 400)

        app_id = first.data['id']
        bad = company.patch(f'/api/applications/{app_id}/',
                            {'recruitment_stage': 'hired'}, format='json')
        self.assertEqual(bad.status_code, 400)

        ok = company.patch(f'/api/applications/{app_id}/',
                           {'recruitment_stage': 'shortlisted'}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(Notification.objects.filter(user=self.cand_user).count(), 1)

        bad_date = company.patch(
            f'/api/applications/{app_id}/',
            {'recruitment_stage': 'interview_scheduled', 'interview_date': 'tomorrow'},
            format='json')
        self.assertEqual(bad_date.status_code, 400)

    def test_company_match_explanation_and_compare(self, _):
        self.job.status = 'approved'
        self.job.save()
        second = make_user('cand2@x.com', 'candidate')
        company = self.client_for(self.company_user)

        r = company.get(f'/api/jobs/{self.job.id}/candidates/{self.cand_user.candidate.id}/match/')
        self.assertEqual(r.status_code, 200)
        statuses = {row['skill']: row['status'] for row in r.data['breakdown']}
        self.assertEqual(statuses['Django'], 'strong')
        self.assertEqual(statuses['PostgreSQL'], 'missing')

        ids = f"{self.cand_user.candidate.id},{second.candidate.id}"
        cmp_json = company.get(f'/api/jobs/{self.job.id}/compare/?candidate_ids={ids}')
        self.assertEqual(cmp_json.status_code, 200)
        self.assertEqual(len(cmp_json.data['candidates']), 2)

        cmp_pdf = company.get(f'/api/jobs/{self.job.id}/compare/?candidate_ids={ids}&export=pdf')
        self.assertEqual(cmp_pdf.status_code, 200)
        self.assertTrue(cmp_pdf.content.startswith(b'%PDF'))

    def test_dashboards(self, _):
        self.job.status = 'approved'
        self.job.save()
        self.assertEqual(self.client_for(self.cand_user).get('/api/dashboard/candidate/').status_code, 200)
        self.assertEqual(self.client_for(self.company_user).get('/api/dashboard/company/').status_code, 200)

class JobFieldsAndMatchScoreTests(APITestCase):
    """Jobs page needs location/salary/type and, for candidates, match_score."""

    def setUp(self):
        from .models import User, Candidate, Company, Job, JobMatch
        cu = User.objects.create_user(email='c@x.com', password='Test1234!xy', name='Cand', role='candidate') \
            if hasattr(User.objects, 'create_user') else None
        if cu is None:
            cu = User(email='c@x.com', name='Cand', role='candidate'); cu.set_password('Test1234!xy'); cu.save()
        self.candidate = Candidate.objects.create(user=cu, cv_file_path='cvs/a.pdf')
        ku = User(email='k@x.com', name='Comp', role='company'); ku.set_password('Test1234!xy'); ku.save()
        company = Company.objects.create(user=ku, company_name='Acme', approved=True)
        self.job = Job.objects.create(
            company=company, title='Backend Dev', required_skills=['Python'],
            location='Biratnagar', salary_range='NPR 60k-80k', job_type='internship', status='approved',
        )
        JobMatch.objects.create(job=self.job, candidate=self.candidate, match_score=72.5)
        self.cu, self.ku = cu, ku

    def test_candidate_sees_fields_and_match_score(self):
        self.client.force_authenticate(self.cu)
        res = self.client.get('/api/jobs/')
        self.assertEqual(res.status_code, 200)
        row = res.data[0] if isinstance(res.data, list) else res.data['results'][0]
        self.assertEqual(row['location'], 'Biratnagar')
        self.assertEqual(row['salary_range'], 'NPR 60k-80k')
        self.assertEqual(row['job_type'], 'internship')
        self.assertEqual(row['job_type_display'], 'Internship')
        self.assertEqual(row['match_score'], 72.5)
        self.assertFalse(row['has_applied'])

    def test_company_gets_no_match_score(self):
        self.client.force_authenticate(self.ku)
        res = self.client.get('/api/jobs/')
        row = res.data[0] if isinstance(res.data, list) else res.data['results'][0]
        self.assertIsNone(row['match_score'])

    def test_company_can_post_job_with_new_fields(self):
        self.client.force_authenticate(self.ku)
        res = self.client.post('/api/jobs/', {
            'title': 'QA', 'required_skills': ['Testing'],
            'location': 'Kathmandu', 'salary_range': '50k', 'job_type': 'remote',
        }, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['job_type'], 'remote')