from matching.skill_normalizer import normalize_skill


def analyze_skill_gap(candidate_skills, job_skills):
    """
    Identify skills required by the job
    that are missing from the candidate.

    Uses the same skill normalization rules
    as the matching engine.
    """

    candidate = {
        normalize_skill(skill)
        for skill in candidate_skills
        if normalize_skill(skill)
    }

    required = {
        normalize_skill(skill)
        for skill in job_skills
        if normalize_skill(skill)
    }

    matched = sorted(candidate.intersection(required))
    missing = sorted(required - candidate)

    if not required:
        gap_percentage = 0.0
    else:
        gap_percentage = (
            len(missing) / len(required)
        ) * 100

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_gap_percentage": round(gap_percentage, 2)
    }