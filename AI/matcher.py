import json
import numpy as np
from pathlib import Path


# -----------------------------
# Load JSON files
# -----------------------------

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# -----------------------------
# Cosine similarity
# -----------------------------

def cosine_similarity(vec1, vec2):
    return float(
        np.dot(vec1, vec2) /
        (
            np.linalg.norm(vec1) *
            np.linalg.norm(vec2)
        )
    )


# -----------------------------
# Skill matching
# -----------------------------

def skill_match(candidate_skills, job_skills):

    candidate_skills = [
        skill.lower()
        for skill in candidate_skills
    ]

    job_skills = [
        skill.lower()
        for skill in job_skills
    ]

    matched = []
    missing = []

    for skill in job_skills:

        if skill in candidate_skills:
            matched.append(skill)

        else:
            missing.append(skill)

    return matched, missing



# -----------------------------
# Experience score
# -----------------------------

def calculate_experience_score(
        candidate_years,
        required_years
):

    try:
        candidate_years = float(candidate_years)
        required_years = float(required_years)

        if candidate_years >= required_years:
            return 100

        score = (
            candidate_years /
            required_years
        ) * 100

        return min(score, 100)

    except:
        return 50



# -----------------------------
# Education score
# -----------------------------

def calculate_education_score(
        education
):

    if education:
        return 100

    return 50



# -----------------------------
# Final score
# -----------------------------

def calculate_final_score(
        skill_score,
        semantic_score,
        experience_score,
        education_score
):

    score = (
        skill_score * 0.4 +
        semantic_score * 0.3 +
        experience_score * 0.2 +
        education_score * 0.1
    )

    return round(float(score), 2)



# -----------------------------
# Main
# -----------------------------

def main():

    base = Path(__file__).parent

    output = base / "output"


    # Load resume and job JSON

    resume = load_json(
        output / "resume.json"
    )

    job = load_json(
        output / "job.json"
    )


    # -----------------------------
    # Skill Matching
    # -----------------------------

    candidate_skills = resume.get(
        "skills",
        []
    )

    job_skills = job.get(
        "required_skills",
        []
    )


    matched, missing = skill_match(
        candidate_skills,
        job_skills
    )


    if len(job_skills) > 0:

        skill_score = (
            len(matched) /
            len(job_skills)
        ) * 100

    else:

        skill_score = 0



    # -----------------------------
    # Semantic Matching
    # -----------------------------

    resume_embedding = np.load(
        output / "resume_embedding.npy"
    )

    job_embedding = np.load(
        output / "job_embedding.npy"
    )


    semantic_score = (
        cosine_similarity(
            resume_embedding,
            job_embedding
        )
        * 100
    )


    semantic_score = float(
        semantic_score
    )



    # -----------------------------
    # Experience Matching
    # -----------------------------

    candidate_exp = resume.get(
        "experience_years",
        0
    )


    required_exp = (
        job.get(
            "experience_required",
            "0"
        )
        .split("+")[0]
        .strip()
    )


    experience_score = calculate_experience_score(
        candidate_exp,
        required_exp
    )



    # -----------------------------
    # Education Matching
    # -----------------------------

    education_score = calculate_education_score(
        resume.get("education", [])
    )



    # -----------------------------
    # Final result
    # -----------------------------

    overall_score = calculate_final_score(
        skill_score,
        semantic_score,
        experience_score,
        education_score
    )


    result = {

        "overall_score": float(
            overall_score
        ),

        "matched_skills": matched,

        "missing_skills": missing,

        "breakdown": {

            "skill_score": round(
                float(skill_score),
                2
            ),

            "semantic_score": round(
                float(semantic_score),
                2
            ),

            "experience_score": round(
                float(experience_score),
                2
            ),

            "education_score": round(
                float(education_score),
                2
            )
        }
    }



    print("\n===== MATCH RESULT =====\n")

    print(
        json.dumps(
            result,
            indent=4
        )
    )



    # Save result

    with open(
        output / "match_result.json",
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            result,
            f,
            indent=4,
            ensure_ascii=False
        )


    print(
        "\n✅ Saved: output/match_result.json"
    )



if __name__ == "__main__":
    main()