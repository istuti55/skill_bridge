import re


def check_timeline(experience):
    """
    Detect potentially overlapping employment periods.
    """

    issues = []

    for i, current in enumerate(experience):

        for j, other in enumerate(experience):

            if i >= j:
                continue

            current_text = str(current).lower()
            other_text = str(other).lower()

            # Basic year detection
            current_years = [
                int(year)
                for year in re.findall(r"\b(19\d{2}|20\d{2})\b", current_text)
            ]

            other_years = [
                int(year)
                for year in re.findall(r"\b(19\d{2}|20\d{2})\b", other_text)
            ]

            if len(current_years) >= 2 and len(other_years) >= 2:

                current_start = min(current_years)
                current_end = max(current_years)

                other_start = min(other_years)
                other_end = max(other_years)

                overlap = (
                    current_start <= other_end
                    and other_start <= current_end
                )

                if overlap:
                    issues.append(
                        "Potentially overlapping employment periods detected."
                    )

    return issues


def check_skill_consistency(skills, experience, projects):
    """
    Look for skills that have little supporting evidence
    in experience or projects.
    """

    evidence_text = (
        " ".join(map(str, experience))
        + " "
        + " ".join(map(str, projects))
    ).lower()

    unsupported = []

    for skill in skills:

        skill_lower = skill.lower().strip()

        if skill_lower and skill_lower not in evidence_text:
            unsupported.append(skill)

    return unsupported


def check_keyword_stuffing(skills):
    """
    Detect duplicate skills or unusually repetitive skill entries.
    """

    normalized = [
        skill.lower().strip()
        for skill in skills
    ]

    duplicates = []

    for skill in set(normalized):

        if normalized.count(skill) > 1:
            duplicates.append(skill)

    return duplicates


def check_credibility(candidate):
    """
    Generate a credibility report.
    """

    experience = candidate.get("experience", [])
    skills = candidate.get("skills", [])
    projects = candidate.get("projects", [])

    timeline_issues = check_timeline(experience)

    unsupported_skills = check_skill_consistency(
        skills,
        experience,
        projects
    )

    duplicate_skills = check_keyword_stuffing(skills)

    issues = []

    if timeline_issues:
        issues.extend(timeline_issues)

    if unsupported_skills:
        issues.append(
            "Some listed skills have limited supporting evidence."
        )

    if duplicate_skills:
        issues.append(
            "Duplicate skill entries detected."
        )

    if not issues:
        status = "No major credibility signals detected."
    else:
        status = "Manual verification recommended."

    return {
        "status": status,
        "timeline_issues": timeline_issues,
        "unsupported_skills": unsupported_skills,
        "duplicate_skills": duplicate_skills,
        "verification_required": bool(issues)
    }