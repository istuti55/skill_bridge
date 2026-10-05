import re

from matching.skill_normalizer import normalize_skill


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
                for year in re.findall(
                    r"\b(19\d{2}|20\d{2})\b",
                    current_text
                )
            ]

            other_years = [
                int(year)
                for year in re.findall(
                    r"\b(19\d{2}|20\d{2})\b",
                    other_text
                )
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
    Evaluate how strongly each listed skill is supported
    by experience and project evidence.

    Evidence levels:

        Strong evidence:
            Skill appears directly in experience or projects.

        Weak evidence:
            A related keyword or variation appears.

        No evidence:
            No relevant evidence is found.

    The function currently returns only unsupported skills
    so the rest of the credibility pipeline remains compatible.
    """

    evidence_text = (
        " ".join(map(str, experience))
        + " "
        + " ".join(map(str, projects))
    ).lower()

    unsupported = []

    # ----------------------------------------------------------
    # COMMON SKILL EVIDENCE ALIASES
    # ----------------------------------------------------------

    evidence_aliases = {

        "python": [
            "python"
        ],

        "javascript": [
            "javascript",
            "js"
        ],

        "typescript": [
            "typescript",
            "ts"
        ],

        "sql": [
            "sql",
            "database",
            "databases"
        ],

        "html5/css3": [
            "html",
            "html5",
            "css",
            "css3"
        ],

        "react": [
            "react",
            "reactjs",
            "react.js"
        ],

        "node.js": [
            "node.js",
            "nodejs",
            "node"
        ],

        "django": [
            "django"
        ],

        "postgresql": [
            "postgresql",
            "postgres",
            "postgres db"
        ],

        "docker": [
            "docker",
            "container",
            "containers"
        ],

        "git": [
            "git",
            "github",
            "version control"
        ],

        "aws": [
            "aws",
            "amazon web services"
        ],

        "ci/cd pipelines": [
            "ci/cd",
            "ci cd",
            "continuous integration",
            "continuous deployment",
            "github actions"
        ],

        "rest api": [
            "rest api",
            "rest apis",
            "restful api",
            "restful apis"
        ]
    }

    # ----------------------------------------------------------
    # CHECK EACH SKILL
    # ----------------------------------------------------------

    for skill in skills:

        normalized_skill = normalize_skill(skill)

        if not normalized_skill:
            continue

        keywords = evidence_aliases.get(
            normalized_skill,
            [normalized_skill]
        )

        # ------------------------------------------------------
        # STRONG EVIDENCE
        # ------------------------------------------------------
        #
        # First keyword represents the direct skill name.
        #

        if any(
            keyword.lower() in evidence_text
            for keyword in keywords[:1]
        ):
            continue

        # ------------------------------------------------------
        # WEAK / RELATED EVIDENCE
        # ------------------------------------------------------
        #
        # Remaining keywords represent related variations.
        #

        if any(
            keyword.lower() in evidence_text
            for keyword in keywords[1:]
        ):
            continue

        # ------------------------------------------------------
        # NO EVIDENCE
        # ------------------------------------------------------

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

    experience = candidate.get(
        "experience",
        []
    )

    skills = candidate.get(
        "skills",
        []
    )

    projects = candidate.get(
        "projects",
        []
    )

    # ==========================================================
    # 1. TIMELINE CHECK
    # ==========================================================

    timeline_issues = check_timeline(
        experience
    )

    # ==========================================================
    # 2. SKILL CONSISTENCY CHECK
    # ==========================================================

    unsupported_skills = check_skill_consistency(
        skills,
        experience,
        projects
    )

    # ==========================================================
    # 3. DUPLICATE SKILL CHECK
    # ==========================================================

    duplicate_skills = check_keyword_stuffing(
        skills
    )

    # ==========================================================
    # 4. COMBINE CREDIBILITY ISSUES
    # ==========================================================

    issues = []

    if timeline_issues:
        issues.extend(
            timeline_issues
        )

    if unsupported_skills:
        issues.append(
            "Some listed skills have limited supporting evidence."
        )

    if duplicate_skills:
        issues.append(
            "Duplicate skill entries detected."
        )

    # ==========================================================
    # 5. STATUS
    # ==========================================================

    if not issues:

        status = (
            "No major credibility signals detected."
        )

    else:

        status = (
            "Manual verification recommended."
        )

    # ==========================================================
    # 6. FINAL RESULT
    # ==========================================================

    return {
        "status": status,
        "timeline_issues": timeline_issues,
        "unsupported_skills": unsupported_skills,
        "duplicate_skills": duplicate_skills,
        "verification_required": bool(issues)
    }