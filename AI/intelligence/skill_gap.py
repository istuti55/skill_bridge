<<<<<<< HEAD
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
        - explanation
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

    if not required:
        summary = (
            "No required skills were provided for this job."
        )

    elif not missing:
        summary = (
            "The candidate has all required skills."
        )

    else:
        summary = (
            f"The candidate is missing {len(missing)} "
            f"of {len(required)} required skills."
        )

    if matched:
        matched_reason = (
            "Matched required skills: "
            + ", ".join(matched)
            + "."
        )
    else:
        matched_reason = (
            "No required skills were matched."
        )

    if missing:
        missing_reason = (
            "Missing required skills: "
            + ", ".join(missing)
            + "."
        )
    else:
        missing_reason = (
            "No required skills are missing."
        )

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_gap_percentage": round(
            gap_percentage,
            2
        ),
        "explanation": {
            "summary": summary,
            "matched_reason": matched_reason,
            "missing_reason": missing_reason
        }
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
        - explanation
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

    if not preferred:
        summary = (
            "No preferred skills were provided for this job."
        )

    elif not missing:
        summary = (
            "The candidate has all preferred skills."
        )

    else:
        summary = (
            f"The candidate is missing {len(missing)} "
            f"of {len(preferred)} preferred skills."
        )

    if matched:
        matched_reason = (
            "Matched preferred skills: "
            + ", ".join(matched)
            + "."
        )
    else:
        matched_reason = (
            "No preferred skills were matched."
        )

    if missing:
        missing_reason = (
            "Missing preferred skills: "
            + ", ".join(missing)
            + "."
        )
    else:
        missing_reason = (
            "No preferred skills are missing."
        )

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_gap_percentage": round(
            gap_percentage,
            2
        ),
        "explanation": {
            "summary": summary,
            "matched_reason": matched_reason,
            "missing_reason": missing_reason
        }
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
            "status": "missing",
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
            "status": "missing",
            "reason": (
                "Preferred skill missing from "
                "candidate profile."
            )
        })

    return priorities
def analyze_skill_gap(
    candidate_skills,
    job_skills
):
    """
    Backward-compatible skill-gap analysis.

    Treats job_skills as required skills.
    """

    return analyze_required_skill_gap(
        candidate_skills,
        job_skills
    )
=======
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


analyze_skill_gap = analyze_required_skill_gap
>>>>>>> d0c4e07 (Fix credibility checks, AI tests and conftest)
