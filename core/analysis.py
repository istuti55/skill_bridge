"""Skill classification (strong / weak / missing) and plain-language gap summary."""
from .ai_bridge import normalize_skill

WEAK_LEVELS = {'weak', 'beginner', 'basic', 'novice', 'learning', 'familiar'}


def _name_and_weight(skill):
    if isinstance(skill, dict):
        return skill.get('name'), skill.get('weight')
    return skill, None


def candidate_levels(skills):
    levels = {}
    for s in skills or []:
        name, _ = _name_and_weight(s)
        key = normalize_skill(str(name)) if name else ''
        if key:
            levels[key] = str(s.get('level', '')).lower() if isinstance(s, dict) else ''
    return levels


def classify(candidate_skills, required_skills, matched_names):
    """
    strong  = candidate lists the exact skill (normal level)
    weak    = low level on CV, OR only a related skill matched
    missing = nothing matched
    """
    levels = candidate_levels(candidate_skills)
    rows = []
    for s in required_skills or []:
        name, weight = _name_and_weight(s)
        if not name or not str(name).strip():
            continue
        key = normalize_skill(str(name))
        if key in levels:
            status = 'weak' if levels[key] in WEAK_LEVELS else 'strong'
        elif key in matched_names:
            status = 'weak'
        else:
            status = 'missing'
        rows.append({
            'skill': name,
            'weight': weight,
            'candidate_has': status != 'missing',
            'status': status,
        })
    return rows


def gap_summary(job_title, rows):
    """Rule-based fallback summary (used when the AI service is down)."""
    strong = [r['skill'] for r in rows if r['status'] == 'strong']
    weak = [r['skill'] for r in rows if r['status'] == 'weak']
    missing = [r['skill'] for r in rows if r['status'] == 'missing']
    total = len(rows)
    if total == 0:
        return f"{job_title} has no required skills listed yet."

    parts = [f"For {job_title}, you are strong in {len(strong)} of {total} required skills."]
    if strong:
        parts.append(f"Your strengths: {', '.join(strong)}.")
    if weak:
        parts.append(f"Build more depth in: {', '.join(weak)}.")
    if missing:
        parts.append(f"You still need to learn: {', '.join(missing)}.")
    if not weak and not missing:
        parts.append("You meet every listed requirement.")
    return ' '.join(parts)