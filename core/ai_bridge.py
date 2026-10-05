import sys
import os

AI_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'AI')
if AI_FOLDER not in sys.path:
    sys.path.insert(0, AI_FOLDER)

from matching.matcher import complete_match
from matching.skill_normalizer import normalize_skill
from intelligence.skill_gap import analyze_skill_gap

def build_weights(required_skills):
    """
    Turn a job's required_skills into {normalized skill name: weight}.
    A skill without a weight counts as 1.0.
    """
    weights = {}
    for s in required_skills or []:
        if isinstance(s, dict):
            name, w = s.get('name'), s.get('weight')
        else:
            name, w = s, None
        key = normalize_skill(str(name)) if name else ''
        if not key:
            continue
        try:
            w = float(w) if w is not None else 1.0
        except (TypeError, ValueError):
            w = 1.0
        weights[key] = max(w, 0.0)
    return weights


def _recommendation(score):
    if score >= 80:
        return "Strong Match"
    if score >= 60:
        return "Moderate Match"
    return "Weak Match"


def get_match_and_gap(candidate_skills, candidate_experience, candidate_education,
                      job_skills, job_experience_required=0, job_education=None,
                      preferred_skills=None, skill_weights=None):
    preferred = preferred_skills or job_skills

    result = complete_match(
        candidate_skills,
        job_skills,
        preferred,
        candidate_experience,
        job_experience_required,
        candidate_education,
        job_education or [],
    )

    skills_score = result["skills_score"]
    overall_score = result["overall_score"]
    recommendation = result["recommendation"]

    # Apply the company's skill weights (0 to 1) on top of the AI result
    if skill_weights:
        matched = {normalize_skill(m) for m in result["matched_skills"]}
        total = sum(skill_weights.values())
        if total > 0:
            got = sum(w for name, w in skill_weights.items() if name in matched)
            skills_score = round(got / total * 100, 2)
            overall_score = round(
                skills_score * 0.70
                + result["experience_score"] * 0.20
                + result["education_score"] * 0.10,
                2,
            )
            recommendation = _recommendation(overall_score)

    return {
        "overall_score": overall_score,
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "breakdown": {
            "skills_score": skills_score,
            "experience_score": result["experience_score"],
            "education_score": result["education_score"],
            "recommendation": recommendation,
        },
    }


def get_skill_gap(candidate_skills, job_skills):
    return analyze_skill_gap(candidate_skills, job_skills)


def get_career_recommendation(candidate_skills, experience, education, missing_skills):
    # Imported here so the server still starts even if Ollama is not ready
    from intelligence.recommender import generate_career_recommendation
    return generate_career_recommendation(
        candidate_skills, experience, education, missing_skills
    )