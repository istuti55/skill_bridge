import re

from matching.skill_normalizer import normalize_skill


def check_timeline(experience):
    """
    Detect potentially overlapping employment periods.

    The function looks for years inside each experience entry
    and compares the inferred employment ranges.
    """

    issues = []

    for i, current in enumerate(experience):

        for j, other in enumerate(experience):

            if i >= j:
                continue

            current_text = str(current).lower()
            other_text = str(other).lower()

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
        The skill or a direct technical variation appears
        in experience or project evidence.

    Weak evidence:
        A related concept appears in experience or projects,
        but the exact skill is not directly demonstrated.

    Unsupported:
        The skill is claimed but no supporting evidence
        is found in experience or projects.

    Important:
        The candidate's skills list itself is NOT considered
        evidence. This prevents a candidate from verifying
        a skill simply by listing it.
    """

    evidence_text = (
        " ".join(map(str, experience))
        + " "
        + " ".join(map(str, projects))
    ).lower()

    strong_evidence = []
    weak_evidence = []
    unsupported_skills = []

    # ==========================================================
    # SKILL EVIDENCE ALIASES
    # ==========================================================

    evidence_aliases = {

        "python": {
            "strong": [
                "python"
            ],
            "weak": [
                "python scripting",
                "python development"
            ]
        },

        "javascript": {
            "strong": [
                "javascript",
                "js"
            ],
            "weak": [
                "frontend development",
                "web development"
            ]
        },

        "typescript": {
            "strong": [
                "typescript",
                "ts"
            ],
            "weak": []
        },

        "sql": {
            "strong": [
                "sql"
            ],
            "weak": [
                "database",
                "databases"
            ]
        },

        "html5/css3": {
            "strong": [
                "html",
                "html5",
                "css",
                "css3"
            ],
            "weak": [
                "frontend",
                "web development"
            ]
        },

        "react": {
            "strong": [
                "react",
                "reactjs",
                "react.js"
            ],
            "weak": []
        },

        "node.js": {
            "strong": [
                "node.js",
                "nodejs",
                "node"
            ],
            "weak": []
        },

        "django": {
            "strong": [
                "django"
            ],
            "weak": [
                "python web framework"
            ]
        },

        "postgresql": {
            "strong": [
                "postgresql",
                "postgres",
                "postgres db"
            ],
            "weak": [
                "database",
                "databases"
            ]
        },

        "docker": {
            "strong": [
                "docker"
            ],
            "weak": [
                "container",
                "containers",
                "containerized"
            ]
        },

        "git": {
            "strong": [
                "git",
                "github"
            ],
            "weak": [
                "version control"
            ]
        },

        "aws": {
            "strong": [
                "aws",
                "amazon web services"
            ],
            "weak": [
                "cloud",
                "cloud hosting",
                "cloud deployment"
            ]
        },

        "ci/cd pipelines": {
            "strong": [
                "ci/cd",
                "ci cd",
                "continuous integration",
                "continuous deployment",
                "github actions"
            ],
            "weak": [
                "automated deployment",
                "deployment pipeline"
            ]
        },

        "rest api": {
            "strong": [
                "rest api",
                "rest apis",
                "restful api",
                "restful apis"
            ],
            "weak": [
                "api",
                "apis"
            ]
        }
    }

    # ==========================================================
    # CHECK EACH SKILL
    # ==========================================================

    for skill in skills:

        normalized_skill = normalize_skill(skill)

        if not normalized_skill:
            continue

        evidence = evidence_aliases.get(
            normalized_skill,
            {
                "strong": [normalized_skill],
                "weak": []
            }
        )

        strong_keywords = evidence["strong"]
        weak_keywords = evidence["weak"]

        # ======================================================
        # STRONG EVIDENCE
        # ======================================================

        if any(
            keyword.lower() in evidence_text
            for keyword in strong_keywords
        ):
            strong_evidence.append(skill)
            continue

        # ======================================================
        # WEAK EVIDENCE
        # ======================================================

        if any(
            keyword.lower() in evidence_text
            for keyword in weak_keywords
        ):
            weak_evidence.append(skill)
            continue

        # ======================================================
        # NO EVIDENCE
        # ======================================================

        unsupported_skills.append(skill)

    return {
        "strong_evidence": strong_evidence,
        "weak_evidence": weak_evidence,
        "unsupported_skills": unsupported_skills
    }


def check_keyword_stuffing(skills):
    """
    Detect duplicate skill entries.

    Matching is case-insensitive.
    """

    normalized = [
        skill.lower().strip()
        for skill in skills
        if skill
    ]

    duplicates = []

    for skill in set(normalized):

        if normalized.count(skill) > 1:
            duplicates.append(skill)

    return sorted(duplicates)


def check_credibility(candidate):
    """
    Generate a complete credibility report.

    Checks:

    1. Employment timeline
    2. Skill evidence
    3. Duplicate skills

    Returns a structured credibility report.
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

    skill_evidence = check_skill_consistency(
        skills,
        experience,
        projects
    )

    strong_evidence = skill_evidence[
        "strong_evidence"
    ]

    weak_evidence = skill_evidence[
        "weak_evidence"
    ]

    unsupported_skills = skill_evidence[
        "unsupported_skills"
    ]

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
        "strong_evidence": strong_evidence,
        "weak_evidence": weak_evidence,
        "unsupported_skills": unsupported_skills,
        "duplicate_skills": duplicate_skills,
        "verification_required": bool(issues)
    }