import json

from llm.ollama_client import call_ollama
from matching.skill_normalizer import normalize_skill


ROLE_PROFILES = {
    "Backend Developer": {
        "core": {
            "python",
            "sql",
            "rest api"
        },
        "supporting": {
            "docker",
            "postgresql",
            "django",
            "node.js"
        },
        "evidence_keywords": [
            "backend",
            "api",
            "apis",
            "rest",
            "microservices",
            "server",
            "database",
            "scalable"
        ]
    },

    "Frontend Developer": {
        "core": {
            "javascript",
            "react",
            "html5/css3"
        },
        "supporting": {
            "typescript"
        },
        "evidence_keywords": [
            "frontend",
            "front-end",
            "user interface",
            "ui",
            "responsive",
            "react",
            "web interface",
            "ux",
            "accessibility"
        ]
    },

    "Full Stack Developer": {
        "core": {
            "javascript",
            "react",
            "node.js"
        },
        "supporting": {
            "typescript",
            "python",
            "sql",
            "rest api",
            "html5/css3"
        },
        "evidence_keywords": [
            "full stack",
            "frontend",
            "backend",
            "api",
            "web application",
            "web applications",
            "database",
            "scalable"
        ]
    },

    "Cloud Engineer": {
        "core": {
            "aws",
            "docker",
            "ci/cd pipelines"
        },
        "supporting": {
            "git"
        },
        "evidence_keywords": [
            "aws",
            "cloud",
            "cloud deployment",
            "cloud hosting",
            "deployment",
            "infrastructure",
            "scalable"
        ]
    },

    "DevOps Engineer": {
        "core": {
            "docker",
            "ci/cd pipelines",
            "git"
        },
        "supporting": {
            "aws"
        },
        "evidence_keywords": [
            "ci/cd",
            "deployment",
            "automated deployment",
            "github actions",
            "devops",
            "infrastructure",
            "docker",
            "cloud"
        ]
    }
}


def _build_evidence_text(experience, projects):
    """
    Combine experience and project information into
    normalized text for deterministic role evidence.
    """

    experience_text = " ".join(
        str(item)
        for item in experience
    )

    project_text = " ".join(
        str(item)
        for item in projects
    )

    return (
        experience_text
        + " "
        + project_text
    ).lower()


def detect_career_roles(
    candidate_skills,
    experience=None,
    projects=None
):
    """
    Determine career roles using:

    1. Core skills
    2. Supporting skills
    3. Experience evidence
    4. Project evidence

    Scoring:

        Core skill       = 20 points
        Supporting skill = 10 points
        Evidence keyword = 5 points

    The final score is normalized to 100.
    """

    experience = experience or []
    projects = projects or []
    candidate_skills = candidate_skills or []

    candidate = {
        normalize_skill(skill)
        for skill in candidate_skills
        if normalize_skill(skill)
    }

    evidence_text = _build_evidence_text(
        experience,
        projects
    )

    role_scores = []

    for role, profile in ROLE_PROFILES.items():

        core_skills = profile["core"]

        supporting_skills = profile["supporting"]

        evidence_keywords = profile[
            "evidence_keywords"
        ]

        matched_core = candidate.intersection(
            core_skills
        )

        matched_supporting = candidate.intersection(
            supporting_skills
        )

        matched_evidence = sorted({
            keyword
            for keyword in evidence_keywords
            if keyword.lower() in evidence_text
        })

        skill_score = (
            len(matched_core) * 20
            + len(matched_supporting) * 10
        )

        evidence_score = (
            len(matched_evidence) * 5
        )

        maximum_skill_score = (
            len(core_skills) * 20
            + len(supporting_skills) * 10
        )

        maximum_evidence_score = (
            len(evidence_keywords) * 5
        )

        maximum_score = (
            maximum_skill_score
            + maximum_evidence_score
        )

        actual_score = (
            skill_score
            + evidence_score
        )

        if maximum_score == 0:
            score = 0.0
        else:
            score = (
                actual_score
                / maximum_score
            ) * 100

        if actual_score > 0:

            role_scores.append({
                "role": role,
                "score": round(
                    score,
                    2
                ),
                "matched_core_skills": sorted(
                    matched_core
                ),
                "matched_supporting_skills": sorted(
                    matched_supporting
                ),
                "matched_evidence": matched_evidence
            })

    role_scores.sort(
        key=lambda item: (
            item["score"],
            len(
                item["matched_core_skills"]
            ),
            len(
                item["matched_evidence"]
            )
        ),
        reverse=True
    )

    return role_scores


def _sanitize_learning_priorities(
    learning_priorities,
    candidate_skills
):
    """
    Sanitize deterministic learning priorities.

    Rules:

    1. Accept priority dictionaries or raw skill names.
    2. Normalize skill names.
    3. Remove empty skills.
    4. Remove skills already possessed by candidate.
    5. Remove duplicate skills.
    6. Preserve priority and reason when available.
    """

    candidate_skills = candidate_skills or []

    candidate_normalized = {
        normalize_skill(skill)
        for skill in candidate_skills
        if normalize_skill(skill)
    }

    sanitized = []
    seen = set()

    for item in learning_priorities or []:

        if isinstance(item, dict):

            raw_skill = item.get(
                "skill",
                ""
            )

            priority = item.get(
                "priority",
                "medium"
            )

            reason = item.get(
                "reason",
                ""
            )

        else:

            raw_skill = item
            priority = "medium"
            reason = ""

        normalized_skill = normalize_skill(
            str(raw_skill)
        )

        if not normalized_skill:
            continue

        if normalized_skill in candidate_normalized:
            continue

        if normalized_skill in seen:
            continue

        seen.add(normalized_skill)

        sanitized.append({
            "skill": normalized_skill,
            "priority": str(
                priority
            ).lower(),
            "reason": str(
                reason
            )
        })

    return sanitized


def _sanitize_learning_path(
    learning_path,
    learning_priorities
):
    """
    Sanitize the learning path generated by Ollama.

    The deterministic learning priorities are authoritative.

    Ollama may provide topics for a skill, but it cannot:

    - add a new learning skill
    - remove a required learning skill
    - change the skill priority
    """

    priority_map = {
        item["skill"]: item["priority"]
        for item in learning_priorities
    }

    path_by_skill = {}

    for item in learning_path or []:

        if not isinstance(item, dict):
            continue

        raw_skill = item.get(
            "skill",
            ""
        )

        normalized_skill = normalize_skill(
            str(raw_skill)
        )

        if not normalized_skill:
            continue

        if normalized_skill not in priority_map:
            continue

        topics = item.get(
            "topics",
            []
        )

        if not isinstance(topics, list):
            topics = []

        clean_topics = []

        for topic in topics:

            if not isinstance(topic, str):
                continue

            topic = topic.strip()

            if not topic:
                continue

            if topic not in clean_topics:
                clean_topics.append(topic)

        path_by_skill[normalized_skill] = {
            "skill": normalized_skill,
            "priority": priority_map[
                normalized_skill
            ],
            "topics": clean_topics
        }

    final_learning_path = []

    for priority_item in learning_priorities:

        skill = priority_item["skill"]

        if skill in path_by_skill:

            final_learning_path.append(
                path_by_skill[skill]
            )

        else:

            final_learning_path.append({
                "skill": skill,
                "priority": priority_item[
                    "priority"
                ],
                "topics": []
            })

    return final_learning_path


def _build_recommendation_reason(
    detected_roles,
    candidate_skills,
    learning_priorities,
    role_scores=None
):
    """
    Build a deterministic explanation for the
    career recommendation.

    The explanation is based only on verified
    candidate skills, role evidence, deterministic
    role scores, and deterministic learning priorities.
    """

    role_scores = role_scores or []

    if detected_roles:
        role_text = ", ".join(
            detected_roles
        )
    else:
        role_text = "the detected career roles"

    normalized_skills = {
        normalize_skill(skill)
        for skill in candidate_skills
        if normalize_skill(skill)
    }

    if normalized_skills:
        skill_text = ", ".join(
            sorted(normalized_skills)
        )
    else:
        skill_text = "the candidate's current skills"

    missing_high = [
        item["skill"]
        for item in learning_priorities
        if item["priority"] == "high"
    ]

    missing_medium = [
        item["skill"]
        for item in learning_priorities
        if item["priority"] == "medium"
    ]

    reason = (
        f"Candidate is best aligned with "
        f"{role_text} based on their current "
        f"skills and experience. "
        f"Current skills include {skill_text}."
    )

    if role_scores:
        evidence_parts = []

        for role in role_scores:

            evidence = []

            if role.get("matched_core_skills"):
                evidence.append(
                    "core skills: "
                    + ", ".join(
                        role["matched_core_skills"]
                    )
                )

            if role.get("matched_supporting_skills"):
                evidence.append(
                    "supporting skills: "
                    + ", ".join(
                        role["matched_supporting_skills"]
                    )
                )

            if role.get("matched_evidence"):
                evidence.append(
                    "experience/project evidence: "
                    + ", ".join(
                        role["matched_evidence"]
                    )
                )

            if evidence:
                evidence_parts.append(
                    f"{role['role']} "
                    f"({role['score']}%) is supported by "
                    + "; ".join(evidence)
                    + "."
                )

        if evidence_parts:
            reason += " " + " ".join(
                evidence_parts
            )

    if missing_high:
        reason += (
            " The main required skill gap is "
            + ", ".join(missing_high)
            + "."
        )

    if missing_medium:
        reason += (
            " Additional preferred skill gaps "
            "include "
            + ", ".join(missing_medium)
            + "."
        )

    return reason


def _build_structured_explanation(
    detected_roles,
    role_scores,
    candidate_skills,
    learning_priorities
):
    """
    Build deterministic structured explainability
    for career recommendations.

    No LLM-generated facts are used here.
    """

    role_reasons = []

    for role in role_scores:

        core_skills = role.get(
            "matched_core_skills",
            []
        )

        supporting_skills = role.get(
            "matched_supporting_skills",
            []
        )

        evidence = role.get(
            "matched_evidence",
            []
        )

        evidence_parts = []

        if core_skills:
            evidence_parts.append(
                "core skills: "
                + ", ".join(core_skills)
            )

        if supporting_skills:
            evidence_parts.append(
                "supporting skills: "
                + ", ".join(supporting_skills)
            )

        if evidence:
            evidence_parts.append(
                "experience/project evidence: "
                + ", ".join(evidence)
            )

        if evidence_parts:
            role_reason = (
                f"{role['role']} scored "
                f"{role['score']}% based on "
                + "; ".join(evidence_parts)
                + "."
            )
        else:
            role_reason = (
                f"{role['role']} scored "
                f"{role['score']}% based on "
                "the available candidate information."
            )

        role_reasons.append({
            "role": role["role"],
            "score": role["score"],
            "core_skills": core_skills,
            "supporting_skills": supporting_skills,
            "evidence": evidence,
            "reason": role_reason
        })

    high_priority = [
        item["skill"]
        for item in learning_priorities
        if item["priority"] == "high"
    ]

    medium_priority = [
        item["skill"]
        for item in learning_priorities
        if item["priority"] == "medium"
    ]

    if high_priority:
        skill_reason = (
            "The main required skill gap is "
            + ", ".join(high_priority)
            + "."
        )
    elif medium_priority:
        skill_reason = (
            "The main identified preferred skill "
            "gaps are "
            + ", ".join(medium_priority)
            + "."
        )
    else:
        skill_reason = (
            "No additional skill gaps were identified "
            "for the current recommendation."
        )

    if learning_priorities:

        learning_reason_parts = []

        for item in learning_priorities:

            learning_reason_parts.append(
                f"{item['skill']} "
                f"({item['priority']} priority)"
            )

        learning_reason = (
            "The learning direction focuses on "
            + ", ".join(
                learning_reason_parts
            )
            + "."
        )

    else:
        learning_reason = (
            "No additional learning priorities "
            "were identified."
        )

    if detected_roles:
        summary = (
            "The recommendation is based on the "
            "candidate's verified skills, role evidence, "
            "and identified skill gaps. Recommended roles: "
            + ", ".join(detected_roles)
            + "."
        )
    else:
        summary = (
            "No career roles could be determined "
            "from the available candidate information."
        )

    return {
        "summary": summary,
        "role_reasons": role_reasons,
        "skill_reason": skill_reason,
        "learning_reason": learning_reason
    }


def generate_career_recommendation(
    candidate_skills,
    experience,
    education,
    missing_skills,
    projects=None,
    learning_priorities=None
):
    """
    Generate practical career recommendations.

    Career roles are detected deterministically
    using skills and evidence.

    Learning priorities are determined by the
    deterministic skill-gap engine.

    Ollama provides:

    - career recommendation explanation
    - learning topics

    The deterministic engine controls:

    - career roles
    - missing skills
    - skill priorities
    - which skills appear in the learning path
    """

    candidate_skills = candidate_skills or []
    experience = experience or []
    education = education or []
    missing_skills = missing_skills or []
    projects = projects or []

    role_scores = detect_career_roles(
        candidate_skills,
        experience,
        projects
    )

    top_roles = role_scores[:3]

    detected_roles = [
        item["role"]
        for item in top_roles
    ]

    sanitized_priorities = (
        _sanitize_learning_priorities(
            learning_priorities,
            candidate_skills
        )
    )

    # Backward-compatible fallback for callers
    # that do not provide deterministic priorities.
    if learning_priorities is None:

        sanitized_priorities = (
            _sanitize_learning_priorities(
                missing_skills,
                candidate_skills
            )
        )

    priority_skills = [
        item["skill"]
        for item in sanitized_priorities
    ]

    # -------------------------------------------------
    # EMPTY CANDIDATE SAFETY HANDLING
    # -------------------------------------------------

    if (
        not candidate_skills
        and not experience
        and not education
        and not projects
        and not missing_skills
        and not sanitized_priorities
    ):

        return {
            "recommended_roles": [],
            "skill_priorities": [],
            "learning_path": [],
            "reason": (
                "Insufficient candidate information "
                "to generate a career recommendation."
            ),
            "explanation": {
                "summary": (
                    "Insufficient candidate information "
                    "to generate a career recommendation."
                ),
                "role_reasons": [],
                "skill_reason": (
                    "No skill-gap analysis could be "
                    "performed because candidate "
                    "information is insufficient."
                ),
                "learning_reason": (
                    "No learning priorities could be "
                    "determined."
                )
            }
        }

    prompt = f"""
You are a career advisor for SkillBridge.

Analyze this candidate and provide practical career recommendations.

Candidate Skills:
{candidate_skills}

Experience:
{experience}

Projects:
{projects}

Education:
{education}

Missing Skills:
{missing_skills}

Deterministic Learning Priorities:
{sanitized_priorities}

Detected Career Roles:
{detected_roles}

Role Analysis:
{top_roles}

Create a practical learning roadmap for every
skill in the Deterministic Learning Priorities.

The career roles have already been determined
by SkillBridge's deterministic role engine.

Return ONLY valid JSON using this structure:

{{
    "recommended_roles": [],
    "skill_priorities": [],
    "learning_path": [
        {{
            "skill": "",
            "priority": "",
            "topics": []
        }}
    ],
    "reason": ""
}}

IMPORTANT RULES:

1. The Detected Career Roles are authoritative.

2. Do NOT add career roles that are not present
   in the Detected Career Roles.

3. Do NOT remove career roles from the
   Detected Career Roles.

4. Return at most 3 recommended roles.

5. Recommend roles that realistically match
   the candidate's skills and evidence.

6. The Deterministic Learning Priorities are
   AUTHORITATIVE.

7. Do NOT add skills to "skill_priorities"
   that are not present in the Deterministic
   Learning Priorities.

8. Do NOT remove skills from the Deterministic
   Learning Priorities.

9. Do NOT recommend a skill that the candidate
   already has.

10. Required missing skills have HIGH priority.

11. Preferred missing skills have MEDIUM priority.

12. For EVERY deterministic learning priority,
    create one learning_path entry.

13. Each learning_path entry must contain:

    - skill
    - priority
    - topics

14. The "skill" must exactly correspond to one
    of the Deterministic Learning Priorities.

15. The "priority" must exactly match the
    deterministic priority.

16. Topics should be practical and ordered from
    beginner fundamentals toward practical,
    production-level usage.

17. For a technical framework or technology,
    include appropriate fundamentals, common
    usage, integration, testing, and deployment
    topics where applicable.

18. Do not invent candidate experience.

19. Keep recommendations practical.

20. Return valid JSON only.
"""

    response = call_ollama(
        prompt
    )

    start = response.find("{")
    end = response.rfind("}")

    if start == -1 or end == -1:

        raise ValueError(
            "No JSON found in Ollama response."
        )

    json_text = response[
        start:end + 1
    ]

    recommendation = json.loads(
        json_text
    )

    # -------------------------------------------------
    # Deterministic career-role enforcement
    # -------------------------------------------------

    recommendation[
        "recommended_roles"
    ] = detected_roles

    # -------------------------------------------------
    # Deterministic skill priority enforcement
    # -------------------------------------------------

    recommendation[
        "skill_priorities"
    ] = priority_skills

    # -------------------------------------------------
    # Deterministic learning-path enforcement
    # -------------------------------------------------

    recommendation[
        "learning_path"
    ] = _sanitize_learning_path(
        recommendation.get(
            "learning_path",
            []
        ),
        sanitized_priorities
    )

    # -------------------------------------------------
    # Deterministic recommendation explanation
    # -------------------------------------------------

    recommendation[
        "reason"
    ] = _build_recommendation_reason(
        detected_roles,
        candidate_skills,
        sanitized_priorities,
        top_roles
    )

    # -------------------------------------------------
    # Deterministic structured explainability
    # -------------------------------------------------

    recommendation[
        "explanation"
    ] = _build_structured_explanation(
        detected_roles,
        top_roles,
        candidate_skills,
        sanitized_priorities
    )

    return recommendation