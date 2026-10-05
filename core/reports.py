import pymupdf as fitz  # PyMuPDF (already in requirements.txt)

from .ai_bridge import normalize_skill
from .matching_service import _names, match_candidate_to_job
from .models import JobMatch

MAX_COMPARE = 6


def _education_text(education):
    parts = []
    for e in education or []:
        if isinstance(e, dict):
            degree = e.get('degree') or e.get('name') or ''
            year = e.get('year') or ''
            parts.append(f"{degree} {year}".strip())
        else:
            parts.append(str(e))
    return '; '.join(p for p in parts if p) or '-'


def build_comparison(job, candidates, applications):
    """
    Side-by-side data: one entry per candidate plus a skill-by-skill table.
    `applications` is a dict {candidate_id: Application}.
    """
    job_skills = _names(job.required_skills)
    people = []

    for c in candidates:
        match = JobMatch.objects.filter(job=job, candidate=c).first()
        if match is None:
            match = match_candidate_to_job(c, job)
        matched = {normalize_skill(m) for m in match.matched_skills}
        app = applications.get(c.id)

        people.append({
            'candidate_id': c.id,
            'name': c.user.name,
            'email': c.user.email,
            'match_score': float(match.match_score),
            'experience_years': float(c.experience_years),
            'education': _education_text(c.education),
            'stage': app.recruitment_stage if app else 'not applied',
            'skills': {s: normalize_skill(s) in matched for s in job_skills},
        })

    people.sort(key=lambda p: p['match_score'], reverse=True)
    return {
        'job_id': job.id,
        'job_title': job.title,
        'company': job.company.company_name,
        'required_skills': job_skills,
        'candidates': people,
    }


def render_pdf(data):
    """Draw the comparison as a landscape A4 table and return PDF bytes."""
    W, H = 842, 595
    margin = 36
    people = data['candidates']
    n = len(people)

    label_w = 170
    col_w = (W - 2 * margin - label_w) / max(n, 1)
    row_h = 24

    rows = [
        ('Match score', [f"{p['match_score']:.1f}%" for p in people], False),
        ('Experience', [f"{p['experience_years']:g} yrs" for p in people], False),
        ('Education', [p['education'] for p in people], False),
        ('Stage', [p['stage'].replace('_', ' ') for p in people], False),
    ]
    for skill in data['required_skills']:
        rows.append((skill, ['Yes' if p['skills'][skill] else 'No' for p in people], True))

    doc = fitz.open()

    def new_page(first):
        page = doc.new_page(width=W, height=H)
        y = margin
        if first:
            page.insert_textbox(
                fitz.Rect(margin, y, W - margin, y + 28),
                'Candidate Comparison Report', fontsize=20, fontname='hebo')
            y += 30
            page.insert_textbox(
                fitz.Rect(margin, y, W - margin, y + 18),
                f"{data['job_title']}  |  {data['company']}", fontsize=11, fontname='helv')
            y += 28
        page.draw_rect(fitz.Rect(margin, y, W - margin, y + row_h),
                       color=(0.2, 0.2, 0.2), fill=(0.9, 0.93, 1), width=0.6)
        page.insert_textbox(fitz.Rect(margin + 4, y + 6, margin + label_w, y + row_h),
                            'Criteria', fontsize=9, fontname='hebo')
        for i, p in enumerate(people):
            x = margin + label_w + i * col_w
            page.insert_textbox(fitz.Rect(x + 4, y + 6, x + col_w - 2, y + row_h),
                                p['name'][:24], fontsize=9, fontname='hebo')
        return page, y + row_h

    page, y = new_page(True)

    for label, values, is_skill in rows:
        h = row_h * 2 if label == 'Education' else row_h
        if y + h > H - margin:
            page, y = new_page(False)

        page.draw_rect(fitz.Rect(margin, y, W - margin, y + h),
                       color=(0.6, 0.6, 0.6), width=0.4)
        page.insert_textbox(fitz.Rect(margin + 4, y + 6, margin + label_w - 2, y + h),
                            label[:28], fontsize=9, fontname='helv')

        for i, val in enumerate(values):
            x = margin + label_w + i * col_w
            color = (0, 0, 0)
            if is_skill:
                color = (0.0, 0.5, 0.1) if val == 'Yes' else (0.75, 0.1, 0.1)
            page.insert_textbox(fitz.Rect(x + 4, y + 6, x + col_w - 2, y + h),
                                str(val)[:80], fontsize=9, fontname='helv', color=color)
        y += h

    data_bytes = doc.tobytes()
    doc.close()
    return data_bytes