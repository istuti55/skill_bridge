from matching.embeddings import create_embedding
from matching.similarity import exact_skill_match
from matching.experience_matcher import experience_match
from matching.education_matcher import education_match
from matching.skill_normalizer import normalize_skills

import numpy as np


def cosine_similarity(vector1, vector2):
    """
    Calculate cosine similarity between two embeddings.

    Embeddings are already normalized, so dot product
    can be used as cosine similarity.
    """

    return float(np.dot(vector1, vector2))


def semantic_skill_match(candidate_skills, job_skills):
    """
    Compare individual candidate skills with individual job skills
    using semantic similarity.

    Exact matches are handled separately by exact_skill_match().
    This function focuses only on semantic matches.
    """

    if not candidate_skills or not job_skills:
        return {
            "score": 0.0,
            "semantic_matches": []
        }

    # Conservative threshold.
    # Prevents loosely related technologies from being
    # incorrectly treated as equivalent skills.
    SEMANTIC_THRESHOLD = 0.75

    # Create one embedding for each candidate skill.
    candidate_embeddings = {
        skill: create_embedding(skill)
        for skill in candidate_skills
    }

    # Create one embedding for each job skill.
    job_embeddings = {
        skill: create_embedding(skill)
        for skill in job_skills
    }

    semantic_matches = []

    # Prevent one candidate skill from satisfying
    # multiple job requirements.
    used_candidate_skills = set()

    for job_skill, job_embedding in job_embeddings.items():

        best_candidate = None
        best_similarity = -1.0

        for candidate_skill, candidate_embedding in candidate_embeddings.items():

            if candidate_skill in used_candidate_skills:
                continue

            similarity = cosine_similarity(
                candidate_embedding,
                job_embedding
            )

            if similarity > best_similarity:
                best_similarity = similarity
                best_candidate = candidate_skill

        # Accept only strong semantic relationships.
        if (
            best_candidate is not None
            and best_similarity >= SEMANTIC_THRESHOLD
        ):
            semantic_matches.append({
                "candidate_skill": best_candidate,
                "job_skill": job_skill,
                "similarity": round(best_similarity, 4)
            })

            used_candidate_skills.add(best_candidate)

    # Semantic score is based on how many job skills
    # received a reliable semantic match.
    if not job_skills:
        score = 0.0
    else:
        score = (
            len(semantic_matches)
            / len(job_skills)
        ) * 100

    return {
        "score": round(score, 2),
        "semantic_matches": semantic_matches
    }


def hybrid_match(candidate_skills, job_skills):
    """
    Combine exact matching and reliable semantic matching.

    Exact matching is performed first.
    Semantic matching is then used only for
    skills that were not matched exactly.

    The final hybrid score represents total
    job-skill coverage:

        exact matches + semantic matches
        -------------------------------- × 100
              total job skills

    This prevents exact matches from being
    incorrectly penalized when no semantic
    matches are needed.
    """

    normalized_candidate_skills = normalize_skills(
        candidate_skills
    )

    normalized_job_skills = normalize_skills(
        job_skills
    )

    # ==========================================================
    # 1. EXACT MATCHING
    # ==========================================================

    exact_result = exact_skill_match(
        normalized_candidate_skills,
        normalized_job_skills
    )

    exact_score = exact_result["score"]

    exact_matched_skills = set(
        exact_result["matched_skills"]
    )

    # ==========================================================
    # 2. REMOVE EXACT MATCHES BEFORE SEMANTIC MATCHING
    # ==========================================================

    unmatched_candidate_skills = [
        skill
        for skill in normalized_candidate_skills
        if skill not in exact_matched_skills
    ]

    unmatched_job_skills = [
        skill
        for skill in normalized_job_skills
        if skill not in exact_matched_skills
    ]

    # ==========================================================
    # 3. SEMANTIC MATCHING
    # ==========================================================

    semantic_result = semantic_skill_match(
        unmatched_candidate_skills,
        unmatched_job_skills
    )

    semantic_score = semantic_result["score"]

    # ==========================================================
    # 4. COMBINE EXACT + SEMANTIC COVERAGE
    # ==========================================================

    total_job_skills = len(
        normalized_job_skills
    )

    total_matched = (
        len(exact_result["matched_skills"])
        + len(semantic_result["semantic_matches"])
    )

    if total_job_skills == 0:
        hybrid_score = 0.0

    else:
        hybrid_score = (
            total_matched
            / total_job_skills
        ) * 100

    hybrid_score = round(
        hybrid_score,
        2
    )

    # ==========================================================
    # 5. COMBINE EXACT + SEMANTIC MATCHES
    # ==========================================================

    matched_skills = set(
        exact_result["matched_skills"]
    )

    missing_skills = set(
        exact_result["missing_skills"]
    )

    for match in semantic_result["semantic_matches"]:

        candidate_skill = match["candidate_skill"]
        job_skill = match["job_skill"]

        # The job skill is now considered matched.
        matched_skills.add(job_skill)

        # Remove it from missing skills.
        if job_skill in missing_skills:
            missing_skills.remove(job_skill)

    # ==========================================================
    # 6. FINAL HYBRID RESULT
    # ==========================================================

    return {
        "hybrid_score": hybrid_score,
        "exact_score": exact_score,
        "semantic_score": semantic_score,
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "semantic_matches": semantic_result["semantic_matches"]
    }


def complete_match(
    candidate_skills,
    required_skills,
    preferred_skills,
    candidate_experience,
    required_experience,
    candidate_education,
    required_education
):
    """
    Calculate the overall candidate-job match.

    Required skills have higher importance than
    preferred skills.

    Skill weighting:
        Required skills  = 80%
        Preferred skills = 20%

    Overall weighting:
        Skills      = 70%
        Experience  = 20%
        Education   = 10%
    """

    # ==========================================================
    # 1. REQUIRED SKILLS
    # ==========================================================

    required_result = hybrid_match(
        candidate_skills,
        required_skills
    )

    required_score = required_result["hybrid_score"]

    # ==========================================================
    # 2. PREFERRED SKILLS
    # ==========================================================

    preferred_result = hybrid_match(
        candidate_skills,
        preferred_skills
    )

    preferred_score = preferred_result["hybrid_score"]

    # ==========================================================
    # 3. REQUIRED vs PREFERRED WEIGHTING
    # ==========================================================

    # Required skills = 80%
    # Preferred skills = 20%

    skill_score = (
        required_score * 0.80
        + preferred_score * 0.20
    )

    skill_score = round(
        skill_score,
        2
    )

    # ==========================================================
    # 4. COMBINE MATCHED SKILLS
    # ==========================================================

    matched_skills = sorted(
        set(required_result["matched_skills"])
        | set(preferred_result["matched_skills"])
    )

    missing_skills = sorted(
        set(required_result["missing_skills"])
        | set(preferred_result["missing_skills"])
    )

    # ==========================================================
    # 5. EXPERIENCE
    # ==========================================================

    experience_score = experience_match(
        candidate_experience,
        required_experience
    )

    # ==========================================================
    # 6. EDUCATION
    # ==========================================================

    education_score = education_match(
        candidate_education,
        required_education
    )

    # ==========================================================
    # 7. FINAL OVERALL SCORE
    # ==========================================================

    overall_score = (
        skill_score * 0.70
        + experience_score * 0.20
        + education_score * 0.10
    )

    overall_score = round(
        overall_score,
        2
    )

    # ==========================================================
    # 8. MATCH RECOMMENDATION
    # ==========================================================

    if overall_score >= 80:
        recommendation = "Strong Match"

    elif overall_score >= 60:
        recommendation = "Moderate Match"

    else:
        recommendation = "Weak Match"

    # ==========================================================
    # 9. FINAL RESULT
    # ==========================================================

    return {
        "overall_score": overall_score,
        "skills_score": skill_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendation": recommendation
    }