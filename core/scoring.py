def _skill_names(skills):
    names = []
    for s in skills or []:
        name = s.get('name') if isinstance(s, dict) else s
        if name and str(name).strip():
            names.append(str(name).strip())
    return names


def calculate_resume_score(skills, education, experience_years, has_cv=True):
    """
    Simple 0-100 resume completeness score.

    Skills (up to 40)        : 4 points per distinct skill, max 10 skills
    Experience (up to 25)    : 5 points per year, max 5 years
    Education (20)           : 20 if at least one entry
    Strong skills (up to 10) : 2 points per skill marked "strong", max 5
    CV uploaded (5)          : 5 if there is a CV
    """
    names = {n.lower() for n in _skill_names(skills)}
    score = min(len(names), 10) * 4

    try:
        years = float(experience_years or 0)
    except (TypeError, ValueError):
        years = 0
    score += min(max(years, 0), 5) * 5

    if education:
        score += 20

    strong = 0
    for s in skills or []:
        if isinstance(s, dict) and str(s.get('level', '')).lower() == 'strong':
            strong += 1
    score += min(strong, 5) * 2

    if has_cv:
        score += 5

    return int(round(min(score, 100)))
def resume_suggestions(skills, education, experience_years, has_cv=True):
    """Plain tips that follow the same rubric as calculate_resume_score."""
    tips = []
    names = {n.lower() for n in _skill_names(skills)}

    if not has_cv:
        tips.append({'area': 'CV', 'tip': 'Upload your CV so SkillBridge can build your profile.'})
        return tips

    if len(names) < 10:
        tips.append({
            'area': 'Skills',
            'tip': f"Your CV lists {len(names)} skills. Add more relevant tools and technologies "
                   f"(up to 10 count towards your score).",
        })

    strong = sum(
        1 for s in skills or []
        if isinstance(s, dict) and str(s.get('level', '')).lower() == 'strong'
    )
    if strong < 5:
        tips.append({
            'area': 'Skill depth',
            'tip': 'Show real depth: mention projects or work where you used your main skills '
                   'so they can be rated as strong.',
        })

    try:
        years = float(experience_years or 0)
    except (TypeError, ValueError):
        years = 0
    if years < 5:
        tips.append({
            'area': 'Experience',
            'tip': 'Add internships, freelance work, open-source or university projects with dates '
                   'to show hands-on experience.',
        })

    if not education:
        tips.append({
            'area': 'Education',
            'tip': 'Add your degree, institution and graduation year.',
        })

    return tips