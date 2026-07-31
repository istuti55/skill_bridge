import sys
import os

AI_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'AI')
sys.path.append(AI_FOLDER)

from parser import extract_text
from skill_gap import find_skill_gap
from matcher import skill_match, cosine_similarity, calculate_experience_score, calculate_education_score, calculate_final_score
from embeddings import create_embedding


def get_match_and_gap(resume_text, candidate_skills, candidate_experience, candidate_education,
                       job_description_text, job_skills, job_experience_required):
    matched, missing = skill_match(candidate_skills, job_skills)

    skill_score = (len(matched) / len(job_skills) * 100) if job_skills else 0
    experience_score = calculate_experience_score(candidate_experience, job_experience_required)
    education_score = calculate_education_score(candidate_education)

    resume_embedding = create_embedding(resume_text)
    job_embedding = create_embedding(job_description_text)
    semantic_score = cosine_similarity(resume_embedding, job_embedding) * 100

    overall_score = calculate_final_score(skill_score, semantic_score, experience_score, education_score)

    return {
        "overall_score": overall_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "breakdown": {
            "skill_score": round(skill_score, 2),
            "semantic_score": round(semantic_score, 2),
            "experience_score": experience_score,
            "education_score": education_score
        }
    }