import re
from datetime import datetime

from matching.skill_normalizer import normalize_skill


def keyword_in_text(keyword: str, text: str) -> bool:
    if not keyword or not text:
        return False
    pattern = r"(?<!\w)" + re.escape(keyword.lower()) + r"(?!\w)"
    return bool(re.search(pattern, text.lower()))


def _parse_job_dates(item):
    current_dt = datetime.now()
    current_year = current_dt.year
    current_month = current_dt.month
    current_total_months = current_year * 12 + current_month

    def parse_year_month(text):
        if not text:
            return None, None
        y_match = re.search(r"\b(19\d{2}|20\d{2})\b", text)
        if not y_match:
            return None, None
        y = int(y_match.group(1))

        m_pattern = (
            r"January|February|March|April|May|June|"
            r"July|August|September|October|November|December|"
            r"Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec"
        )
        m_match = re.search(m_pattern, text, re.IGNORECASE)
        m = None
        if m_match:
            m_str = m_match.group(0)[:3].capitalize()
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            if m_str in months:
                m = months.index(m_str) + 1
        return y, m

    if isinstance(item, dict):
        start_raw = str(item.get("start_date", "")).strip()
        end_raw = str(item.get("end_date", "")).strip()
        is_current = bool(item.get("current", False)) or end_raw.lower() in ["present", "current", "now", "ongoing"]

        start_year, start_month = parse_year_month(start_raw)
        if not start_year:
            text = f"{start_raw} {end_raw} {item.get('title', '')} {item.get('company', '')} {item.get('details', '')}"
            years = [int(y) for y in re.findall(r"\b(19\d{2}|20\d{2})\b", text)]
            if len(years) >= 1:
                start_year = min(years)
                start_month = 1

        if not start_year:
            return None, None, False

        start_month = start_month or 1
        start_val = start_year * 12 + start_month

        if is_current:
            end_val = current_total_months
        else:
            end_year, end_month = parse_year_month(end_raw)
            if not end_year:
                years = [int(y) for y in re.findall(r"\b(19\d{2}|20\d{2})\b", f"{start_raw} {end_raw}")]
                if len(years) >= 2:
                    end_year = max(years)
                    end_month = 12
                else:
                    end_year = start_year
                    end_month = 12
            else:
                end_month = end_month or 12
            end_val = end_year * 12 + end_month

        return start_val, end_val, is_current

    else:
        text = str(item)
        is_current = bool(re.search(r"\b(present|current|now|ongoing)\b", text, re.IGNORECASE))
        years = [int(y) for y in re.findall(r"\b(19\d{2}|20\d{2})\b", text)]

        if not years:
            return None, None, False

        start_year = min(years)
        start_val = start_year * 12 + 1

        if is_current:
            end_val = current_total_months
        elif len(years) >= 2:
            end_year = max(years)
            end_val = end_year * 12 + 12
        else:
            end_val = start_year * 12 + 12

        return start_val, end_val, is_current


def check_timeline(experience):
    """
    Detect potentially overlapping employment periods.
    Uses start_date, end_date, and current from each job.
    Back-to-back jobs are not flagged; real overlaps and current jobs are.
    """
    jobs = []
    for item in experience:
        start_val, end_val, is_current = _parse_job_dates(item)
        if start_val is not None and end_val is not None:
            jobs.append({
                "start": start_val,
                "end": end_val,
                "current": is_current
            })

    overlap_found = False
    for i in range(len(jobs)):
        for j in range(i + 1, len(jobs)):
            j1, j2 = jobs[i], jobs[j]
            # Strict overlap check: start1 < end2 and start2 < end1
            if j1["start"] < j2["end"] and j2["start"] < j1["end"]:
                overlap_found = True
                break
        if overlap_found:
            break

    if overlap_found:
        return ["Potentially overlapping employment periods detected."]
    return []


def check_skill_consistency(skills, experience, projects):
    """
    Evaluate how strongly each listed skill is supported
    by experience and project evidence.
    Uses whole-word matching.
    """

    evidence_text = (
        " ".join(map(str, experience))
        + " "
        + " ".join(map(str, projects))
    )

    strong_evidence = []
    weak_evidence = []
    unsupported_skills = []

    # ==========================================================
    # SKILL EVIDENCE ALIASES
    # ==========================================================

    evidence_aliases = {
        "python": {
            "strong": ["python"],
            "weak": ["python scripting", "python development"]
        },
        "javascript": {
            "strong": ["javascript", "js"],
            "weak": ["frontend development", "web development"]
        },
        "typescript": {
            "strong": ["typescript", "ts"],
            "weak": []
        },
        "sql": {
            "strong": ["sql"],
            "weak": ["database", "databases"]
        },
        "html5/css3": {
            "strong": ["html", "html5", "css", "css3"],
            "weak": ["frontend", "web development"]
        },
        "react": {
            "strong": ["react", "reactjs", "react.js"],
            "weak": []
        },
        "node.js": {
            "strong": ["node.js", "nodejs", "node"],
            "weak": []
        },
        "django": {
            "strong": ["django"],
            "weak": ["python web framework"]
        },
        "postgresql": {
            "strong": ["postgresql", "postgres", "postgres db"],
            "weak": ["database", "databases"]
        },
        "docker": {
            "strong": ["docker"],
            "weak": ["container", "containers", "containerized"]
        },
        "git": {
            "strong": ["git", "github"],
            "weak": ["version control"]
        },
        "aws": {
            "strong": ["aws", "amazon web services"],
            "weak": ["cloud", "cloud hosting", "cloud deployment"]
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

        if any(keyword_in_text(kw, evidence_text) for kw in strong_keywords):
            strong_evidence.append(skill)
            continue

        if any(keyword_in_text(kw, evidence_text) for kw in weak_keywords):
            weak_evidence.append(skill)
            continue

        unsupported_skills.append(skill)

    return {
        "strong_evidence": strong_evidence,
        "weak_evidence": weak_evidence,
        "unsupported_skills": unsupported_skills
    }


def check_keyword_stuffing(skills):
    """
    Detect duplicate skill entries after normalization.
    """
    if not skills:
        return []

    normalized = []
    for skill in skills:
        if not skill:
            continue
        norm = normalize_skill(str(skill))
        if norm:
            normalized.append(norm)

    duplicates = set()
    seen = set()
    for norm in normalized:
        if norm in seen:
            duplicates.add(norm)
        else:
            seen.add(norm)

    return sorted(list(duplicates))


def check_credibility(candidate):
    """
    Generate a complete credibility report.
    """
    experience = candidate.get("experience", [])
    skills = candidate.get("skills", [])
    projects = candidate.get("projects", [])

    timeline_issues = check_timeline(experience)
    skill_evidence = check_skill_consistency(skills, experience, projects)

    strong_evidence = skill_evidence["strong_evidence"]
    weak_evidence = skill_evidence["weak_evidence"]
    unsupported_skills = skill_evidence["unsupported_skills"]

    duplicate_skills = check_keyword_stuffing(skills)

    issues = []
    if timeline_issues:
        issues.extend(timeline_issues)

    if unsupported_skills:
        issues.append("Some listed skills have limited supporting evidence.")

    if duplicate_skills:
        issues.append("Duplicate skill entries detected.")

    if not issues:
        status = "No major credibility signals detected."
    else:
        status = "Manual verification recommended."

    return {
        "status": status,
        "timeline_issues": timeline_issues,
        "strong_evidence": strong_evidence,
        "weak_evidence": weak_evidence,
        "unsupported_skills": unsupported_skills,
        "duplicate_skills": duplicate_skills,
        "verification_required": bool(issues)
    }