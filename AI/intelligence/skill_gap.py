def analyze_skill_gap(candidate_skills, job_skills):
    """
    Identify skills required by the job
    that are missing from the candidate.
    """

    candidate = {
        skill.lower().strip()
        for skill in candidate_skills
    }

    required = {
        skill.lower().strip()
        for skill in job_skills
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