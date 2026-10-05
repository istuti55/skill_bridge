from matching.skill_normalizer import normalize_skill


def exact_skill_match(candidate_skills, job_skills):
    candidate = {
        normalize_skill(skill)
        for skill in candidate_skills
        if normalize_skill(skill)
    }

    job = {
        normalize_skill(skill)
        for skill in job_skills
        if normalize_skill(skill)
    }

    matched = candidate.intersection(job)
    missing = job - candidate

    if len(job) == 0:
        score = 0.0
    else:
        score = len(matched) / len(job)

    return {
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "score": round(score * 100, 2)
    }