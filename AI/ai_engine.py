import json
import re
from datetime import datetime
from pathlib import Path

from parsing.resume_parser import parse_resume
from parsing.job_parser import parse_job

from matching.matcher import complete_match

from intelligence.skill_gap import analyze_skill_gap
from intelligence.recommender import generate_career_recommendation

from verification.credibility import check_credibility


def calculate_experience_years(experience):
    """
    Calculate approximate total professional experience.

    Expected experience format:

    {
        "title": "Software Engineer",
        "company": "TechCorp Solutions",
        "start_date": "June 2023",
        "end_date": "Present",
        "current": true,
        "details": "..."
    }
    """

    total_months = 0
    current_date = datetime.now()

    for item in experience:

        if not isinstance(item, dict):
            continue

        start_date = str(
            item.get("start_date", "")
        ).strip()

        end_date = str(
            item.get("end_date", "")
        ).strip()

        current = item.get(
            "current",
            False
        )

        # Skip if no start date exists
        if not start_date:
            continue

        # ------------------------------------------------------
        # Extract start year
        # ------------------------------------------------------

        start_match = re.search(
            r"\b(19\d{2}|20\d{2})\b",
            start_date
        )

        if not start_match:
            continue

        start_year = int(
            start_match.group(1)
        )

        # ------------------------------------------------------
        # Extract start month
        # ------------------------------------------------------

        month_pattern = (
            r"January|February|March|April|May|June|"
            r"July|August|September|October|November|December"
        )

        start_month_match = re.search(
            month_pattern,
            start_date,
            re.IGNORECASE
        )

        if start_month_match:

            start_month = datetime.strptime(
                start_month_match.group(0),
                "%B"
            ).month

        else:

            # If only year is available,
            # assume January.
            start_month = 1

        # ------------------------------------------------------
        # Determine end date
        # ------------------------------------------------------

        if (
            current
            or end_date.lower() == "present"
        ):

            end_year = current_date.year
            end_month = current_date.month

        else:

            end_match = re.search(
                r"\b(19\d{2}|20\d{2})\b",
                end_date
            )

            if not end_match:
                continue

            end_year = int(
                end_match.group(1)
            )

            end_month_match = re.search(
                month_pattern,
                end_date,
                re.IGNORECASE
            )

            if end_month_match:

                end_month = datetime.strptime(
                    end_month_match.group(0),
                    "%B"
                ).month

            else:

                # If only year is available,
                # assume December.
                end_month = 12

        # ------------------------------------------------------
        # Calculate months
        # ------------------------------------------------------

        months = (
            (end_year - start_year) * 12
            + (end_month - start_month)
        )

        # Prevent invalid negative periods
        if months > 0:
            total_months += months

    return round(
        total_months / 12,
        1
    )


def analyze_candidate(pdf_path, job_description):
    """
    Complete SkillBridge AI pipeline.

    Resume PDF
        ↓
    Resume Parser
        ↓
    Candidate JSON

    Job Description
        ↓
    Job Parser
        ↓
    Job JSON

    Candidate + Job
        ↓
    Credibility
        ↓
    Matching
        ↓
    Skill Gap
        ↓
    Career Recommendation
        ↓
    Final JSON
    """

    # ==========================================================
    # 1. RESUME PARSING
    # ==========================================================

    print("1. Parsing resume...")

    resume_result = parse_resume(pdf_path)

    # parse_resume may return JSON string or dictionary
    if isinstance(resume_result, str):

        try:

            resume_data = json.loads(
                resume_result
            )

        except json.JSONDecodeError as e:

            raise ValueError(
                f"Resume parser returned invalid JSON: {e}"
            )

    else:

        resume_data = resume_result

    print("✓ Resume parsed")


    # ==========================================================
    # 2. JOB PARSING
    # ==========================================================

    print("2. Parsing job description...")

    job_data = parse_job(
        job_description
    )

    print("✓ Job parsed")


    # ==========================================================
    # 3. EXTRACT CANDIDATE INFORMATION
    # ==========================================================

    candidate_skills = resume_data.get(
        "skills",
        []
    )

    candidate_experience = resume_data.get(
        "experience",
        []
    )

    candidate_education = resume_data.get(
        "education",
        []
    )


    # ==========================================================
    # 4. EXTRACT JOB INFORMATION
    # ==========================================================

    required_skills = job_data.get(
        "required_skills",
        []
    )

    preferred_skills = job_data.get(
        "preferred_skills",
        []
    )

    # Combine required and preferred skills
    job_skills = (
        required_skills
        + preferred_skills
    )

    required_experience = job_data.get(
        "minimum_experience",
        0
    )

    required_education = job_data.get(
        "education",
        []
    )


    # ==========================================================
    # 5. CREDIBILITY CHECK
    # ==========================================================

    print("3. Checking resume credibility...")

    credibility = check_credibility(
        resume_data
    )

    print("✓ Credibility checked")


    # ==========================================================
    # 6. CALCULATE EXPERIENCE
    # ==========================================================

    print("4. Calculating candidate-job match...")

    candidate_experience_years = (
        calculate_experience_years(
            candidate_experience
        )
    )

    print(
        f"✓ Candidate experience: "
        f"{candidate_experience_years} years"
    )

    print(
        f"✓ Required experience: "
        f"{required_experience} years"
    )


    # ==========================================================
    # 7. MATCHING ENGINE
    # ==========================================================

    match_result = complete_match(
    candidate_skills,
    required_skills,
    preferred_skills,
    candidate_experience_years,
    required_experience,
    candidate_education,
    required_education
)
    print("✓ Match calculated")


    # ==========================================================
    # 8. SKILL GAP
    # ==========================================================

    print("5. Analyzing skill gap...")

    skill_gap = analyze_skill_gap(
        candidate_skills,
        job_skills
    )

    print("✓ Skill gap calculated")


    # ==========================================================
    # 9. CAREER RECOMMENDATION
    # ==========================================================

    print("6. Generating career recommendation...")

    recommendation = generate_career_recommendation(
        candidate_skills,
        candidate_experience,
        candidate_education,
        skill_gap["missing_skills"]
    )

    print("✓ Recommendation generated")


    # ==========================================================
    # 10. FINAL RESULT
    # ==========================================================

    final_result = {
        "candidate": resume_data,

        "job": job_data,

        "credibility": credibility,

        "matching": match_result,

        "skill_gap": skill_gap,

        "career_recommendation": recommendation
    }


    # ==========================================================
    # 11. SAVE FINAL JSON
    # ==========================================================

    output_dir = (
        Path(__file__).parent
        / "output"
    )

    output_dir.mkdir(
        exist_ok=True
    )

    output_file = (
        output_dir
        / "final_result.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            final_result,
            f,
            indent=4,
            ensure_ascii=False
        )


    print(
        "\n✓ Final result saved to:"
    )

    print(
        output_file.resolve()
    )


    return final_result


# ==============================================================
# DIRECT TEST
# ==============================================================

if __name__ == "__main__":

    pdf_path = (
        "sample_resumes/Resume.pdf"
    )

    job_description = """
    We are looking for a Python Backend Developer.

    Required skills:
    Python
    FastAPI
    SQL
    Docker
    Git

    Preferred skills:
    AWS

    Minimum experience:
    2 years

    Education:
    Bachelor of Engineering in Computer Engineering

    Responsibilities:
    Develop backend APIs.
    Design database systems.
    Build scalable applications.
    """

    print(
        "\n===== STARTING SKILLBRIDGE AI =====\n"
    )

    result = analyze_candidate(
        pdf_path,
        job_description
    )

    print(
        "\n===== FINAL AI RESULT =====\n"
    )

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False
        )
    )