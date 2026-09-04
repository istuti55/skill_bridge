from matching.embeddings import create_embedding
from matching.similarity import exact_skill_match
from matching.experience_matcher import experience_match
from matching.experience_matcher import experience_match
from matching.education_matcher import education_match

import numpy as np


def cosine_similarity(vector1, vector2):
    """
    Calculate cosine similarity between two embeddings.
    Embeddings are already normalized, so dot product is sufficient.
    """

    return float(np.dot(vector1, vector2))


def semantic_skill_match(candidate_skills, job_skills):
    """
    Compare candidate skills and job skills semantically.
    """

    if not candidate_skills or not job_skills:
        return 0.0

    candidate_text = " ".join(candidate_skills)
    job_text = " ".join(job_skills)

    candidate_embedding = create_embedding(candidate_text)
    job_embedding = create_embedding(job_text)

    similarity = cosine_similarity(
        candidate_embedding,
        job_embedding
    )

    # Convert -1 to 1 similarity into 0 to 100
    score = ((similarity + 1) / 2) * 100

    return round(score, 2)


def hybrid_match(candidate_skills, job_skills):
    """
    Combine exact and semantic matching.
    """

    # Exact matching
    exact_result = exact_skill_match(
        candidate_skills,
        job_skills
    )

    exact_score = exact_result["score"]

    # Semantic matching
    semantic_score = semantic_skill_match(
        candidate_skills,
        job_skills
    )

    # Hybrid score
    #
    # Exact matching = 60%
    # Semantic matching = 40%
    hybrid_score = (
        0.60 * exact_score +
        0.40 * semantic_score
    )

    return {
        "hybrid_score": round(hybrid_score, 2),
        "exact_score": exact_score,
        "semantic_score": semantic_score,
        "matched_skills": exact_result["matched_skills"],
        "missing_skills": exact_result["missing_skills"]
    }

def complete_match(
    candidate_skills,
    job_skills,
    candidate_experience,
    required_experience
):
    """
    Calculate the overall candidate-job match.
    """

    skill_result = hybrid_match(
        candidate_skills,
        job_skills
    )

    experience_score = experience_match(
        candidate_experience,
        required_experience
    )

    overall_score = (
        skill_result["hybrid_score"] * 0.80
        + experience_score * 0.20
    )

    return {
        "overall_score": round(overall_score, 2),
        "skill_score": skill_result["hybrid_score"],
        "experience_score": experience_score,
        "matched_skills": skill_result["matched_skills"],
        "missing_skills": skill_result["missing_skills"]
    }

def complete_match(
    candidate_skills,
    job_skills,
    candidate_experience,
    required_experience,
    candidate_education,
    required_education
):
    """
    Calculate the overall candidate-job match.
    """

    # 1. Skills
    skill_result = hybrid_match(
        candidate_skills,
        job_skills
    )

    # 2. Experience
    experience_score = experience_match(
        candidate_experience,
        required_experience
    )

    # 3. Education
    education_score = education_match(
        candidate_education,
        required_education
    )

    # Weighted overall score
    overall_score = (
        skill_result["hybrid_score"] * 0.70
        + experience_score * 0.20
        + education_score * 0.10
    )

    # Classification
    if overall_score >= 80:
        recommendation = "Strong Match"
    elif overall_score >= 60:
        recommendation = "Moderate Match"
    else:
        recommendation = "Weak Match"

    return {
        "overall_score": round(overall_score, 2),
        "skills_score": skill_result["hybrid_score"],
        "experience_score": experience_score,
        "education_score": education_score,
        "matched_skills": skill_result["matched_skills"],
        "missing_skills": skill_result["missing_skills"],
        "recommendation": recommendation
    }