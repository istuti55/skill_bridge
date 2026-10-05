from matching.skill_normalizer import normalize_skill


def analyze_required_skill_gap(
    candidate_skills,
    required_skills
):
    """
    Analyze the gap between candidate skills
    and required job skills.

    Returns:
        - matched required skills
        - missing required skills
        - required skill gap percentage
    """

    candidate = {
        normalize_skill(skill)
        for skill in candidate_skills
        if normalize_skill(skill)
    }

    required = {
        normalize_skill(skill)
        for skill in required_skills
        if normalize_skill(skill)
    }

    matched = sorted(
        candidate.intersection(required)
    )

    missing = sorted(
        required - candidate
    )

    if not required:
        gap_percentage = 0.0
    else:
        gap_percentage = (
            len(missing) / len(required)
        ) * 100

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_gap_percentage": round(
            gap_percentage,
            2
        )
    }


def analyze_preferred_skill_gap(
    candidate_skills,
    preferred_skills
):
    """
    Analyze the gap between candidate skills
    and preferred job skills.

    Preferred skills are optional/desirable,
    so they are analyzed separately from
    required skills.

    Returns:
        - matched preferred skills
        - missing preferred skills
        - preferred skill gap percentage
    """

    candidate = {
        normalize_skill(skill)
        for skill in candidate_skills
        if normalize_skill(skill)
    }

    preferred = {
        normalize_skill(skill)
        for skill in preferred_skills
        if normalize_skill(skill)
    }

    matched = sorted(
        candidate.intersection(preferred)
    )

    missing = sorted(
        preferred - candidate
    )

    if not preferred:
        gap_percentage = 0.0
    else:
        gap_percentage = (
            len(missing) / len(preferred)
        ) * 100

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_gap_percentage": round(
            gap_percentage,
            2
        )
    }


def prioritize_missing_skills(
    required_missing,
    preferred_missing
):
    """
    Prioritize missing skills based on
    their importance to the job.

    Required missing skills:
        HIGH priority

    Preferred missing skills:
        MEDIUM priority

    Returns:
        A list of prioritized missing skills.
    """

    priorities = []

    for skill in required_missing:

        normalized_skill = normalize_skill(skill)

        if not normalized_skill:
            continue

        priorities.append({
            "skill": normalized_skill,
            "priority": "high",
            "reason": (
                "Required skill missing from "
                "candidate profile."
            )
        })

    for skill in preferred_missing:

        normalized_skill = normalize_skill(skill)

        if not normalized_skill:
            continue

        priorities.append({
            "skill": normalized_skill,
            "priority": "medium",
            "reason": (
                "Preferred skill missing from "
                "candidate profile."
            )
        })

    return priorities