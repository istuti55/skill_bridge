import sys
import os

AI_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'AI')
if AI_FOLDER not in sys.path:
    sys.path.insert(0, AI_FOLDER)

from matching.matcher import complete_match
from matching.skill_normalizer import normalize_skill
from intelligence.skill_gap import analyze_skill_gap


def get_match_and_gap(candidate_skills, candidate_experience, candidate_education,
                      job_skills, job_experience_required=0, job_education=None,
                      preferred_skills=None):
    # The AI matcher scores required skills (80%) and preferred skills (20%).
    # Our jobs only have required skills, so when there are no preferred skills
    # we reuse the required list. Otherwise the skill score is capped at 80%.
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

    return {
        "overall_score": result["overall_score"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "breakdown": {
            "skills_score": result["skills_score"],
            "experience_score": result["experience_score"],
            "education_score": result["education_score"],
            "recommendation": result["recommendation"],
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