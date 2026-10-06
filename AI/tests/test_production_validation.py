import json
from pathlib import Path

from ai_engine import analyze_candidate


RESUME_PATH = "sample_resumes/Resume.pdf"

JOB_DESCRIPTION = """
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


def test_production_pipeline():

    print("\n========================================")
    print("   SKILLBRIDGE FINAL PRODUCTION TEST")
    print("========================================")

    # -----------------------------------------
    # 1. Verify input resume exists
    # -----------------------------------------

    resume_path = Path(RESUME_PATH)

    print("\n[1] Checking input resume...")

    assert resume_path.exists(), (
        f"Resume file not found: {RESUME_PATH}"
    )

    assert resume_path.is_file()

    print("✓ Resume exists")


    # -----------------------------------------
    # 2. Run complete AI pipeline
    # -----------------------------------------

    print("\n[2] Running complete AI pipeline...")

    result = analyze_candidate(
        RESUME_PATH,
        JOB_DESCRIPTION
    )

    assert isinstance(result, dict)

    print("✓ AI pipeline completed")


    # -----------------------------------------
    # 3. Verify top-level structure
    # -----------------------------------------

    print("\n[3] Checking final result structure...")

    required_sections = [
        "candidate",
        "job",
        "credibility",
        "matching",
        "skill_gap",
        "career_recommendation"
    ]

    for section in required_sections:

        assert section in result, (
            f"Missing section: {section}"
        )

        print(f"✓ {section}")


    # -----------------------------------------
    # 4. Verify candidate data
    # -----------------------------------------

    print("\n[4] Checking candidate data...")

    candidate = result["candidate"]

    assert isinstance(candidate, dict)

    assert "personal" in candidate
    assert "summary" in candidate
    assert "skills" in candidate
    assert "education" in candidate
    assert "experience" in candidate
    assert "projects" in candidate
    assert "certifications" in candidate

    assert isinstance(
        candidate["skills"],
        list
    )

    assert isinstance(
        candidate["experience"],
        list
    )

    print("✓ Candidate structure valid")


    # -----------------------------------------
    # 5. Verify job data
    # -----------------------------------------

    print("\n[5] Checking job data...")

    job = result["job"]

    assert isinstance(job, dict)

    assert "job_title" in job
    assert "required_skills" in job
    assert "preferred_skills" in job
    assert "minimum_experience" in job
    assert "education" in job
    assert "responsibilities" in job

    assert isinstance(
        job["required_skills"],
        list
    )

    assert isinstance(
        job["preferred_skills"],
        list
    )

    print("✓ Job structure valid")


    # -----------------------------------------
    # 6. Verify credibility
    # -----------------------------------------

    print("\n[6] Checking credibility...")

    credibility = result["credibility"]

    credibility_fields = [
        "status",
        "timeline_issues",
        "strong_evidence",
        "weak_evidence",
        "unsupported_skills",
        "duplicate_skills",
        "verification_required"
    ]

    for field in credibility_fields:

        assert field in credibility

    assert isinstance(
        credibility["verification_required"],
        bool
    )

    print("✓ Credibility structure valid")


    # -----------------------------------------
    # 7. Verify matching
    # -----------------------------------------

    print("\n[7] Checking matching result...")

    matching = result["matching"]

    score_fields = [
        "overall_score",
        "skills_score",
        "experience_score",
        "education_score"
    ]

    for field in score_fields:

        assert field in matching

        score = matching[field]

        assert isinstance(
            score,
            (int, float)
        )

        assert 0 <= score <= 100

    assert "matched_skills" in matching
    assert "missing_skills" in matching
    assert "recommendation" in matching

    print(
        f"✓ Overall score: "
        f"{matching['overall_score']}"
    )

    print(
        f"✓ Recommendation: "
        f"{matching['recommendation']}"
    )


    # -----------------------------------------
    # 8. Verify skill gap
    # -----------------------------------------

    print("\n[8] Checking skill gap...")

    skill_gap = result["skill_gap"]

    assert "required" in skill_gap
    assert "preferred" in skill_gap
    assert "learning_priorities" in skill_gap

    required_gap = skill_gap["required"]
    preferred_gap = skill_gap["preferred"]

    for gap in [
        required_gap,
        preferred_gap
    ]:

        assert "matched_skills" in gap
        assert "missing_skills" in gap
        assert "skill_gap_percentage" in gap

        percentage = gap[
            "skill_gap_percentage"
        ]

        assert 0 <= percentage <= 100

    assert isinstance(
        skill_gap["learning_priorities"],
        list
    )

    print(
        f"✓ Required skill gap: "
        f"{required_gap['skill_gap_percentage']}%"
    )

    print(
        f"✓ Preferred skill gap: "
        f"{preferred_gap['skill_gap_percentage']}%"
    )


    # -----------------------------------------
    # 9. Verify career recommendation
    # -----------------------------------------

    print("\n[9] Checking career recommendation...")

    recommendation = result[
        "career_recommendation"
    ]

    assert "recommended_roles" in recommendation
    assert "skill_priorities" in recommendation
    assert "learning_path" in recommendation
    assert "reason" in recommendation

    assert isinstance(
        recommendation["recommended_roles"],
        list
    )

    assert isinstance(
        recommendation["skill_priorities"],
        list
    )

    assert isinstance(
        recommendation["learning_path"],
        list
    )

    assert isinstance(
        recommendation["reason"],
        str
    )

    assert recommendation["reason"].strip()

    print(
        "✓ Recommended roles:",
        recommendation["recommended_roles"]
    )

    print(
        "✓ Skill priorities:",
        recommendation["skill_priorities"]
    )


    # -----------------------------------------
    # 10. Verify learning-path consistency
    # -----------------------------------------

    print(
        "\n[10] Checking learning-path consistency..."
    )

    priority_skills = [
        item["skill"]
        for item in skill_gap[
            "learning_priorities"
        ]
    ]

    recommendation_skills = (
        recommendation[
            "skill_priorities"
        ]
    )

    path_skills = [
        item["skill"]
        for item in recommendation[
            "learning_path"
        ]
    ]

    assert (
        recommendation_skills
        == priority_skills
    )

    assert (
        path_skills
        == priority_skills
    )

    print(
        "✓ Learning priorities are consistent"
    )

    print(
        "✓ Learning path is consistent"
    )


    # -----------------------------------------
    # 11. Verify output JSON file
    # -----------------------------------------

    print("\n[11] Checking output file...")

    output_path = Path(
        "output/final_result.json"
    )

    assert output_path.exists(), (
        "output/final_result.json was not created"
    )

    assert output_path.is_file()

    print(
        f"✓ Output file exists: {output_path}"
    )


    # -----------------------------------------
    # 12. Validate saved JSON
    # -----------------------------------------

    print("\n[12] Validating saved JSON...")

    with open(
        output_path,
        "r",
        encoding="utf-8"
    ) as file:

        saved_result = json.load(file)

    assert isinstance(
        saved_result,
        dict
    )

    for section in required_sections:

        assert section in saved_result

    print("✓ Saved JSON is valid")


    # -----------------------------------------
    # 13. Verify saved result matches result
    # -----------------------------------------

    print(
        "\n[13] Comparing returned and saved result..."
    )

    assert saved_result == result

    print(
        "✓ Returned result matches saved JSON"
    )


    # -----------------------------------------
    # FINAL
    # -----------------------------------------

    print("\n========================================")
    print("   ✓ PRODUCTION VALIDATION PASSED")
    print("========================================")


if __name__ == "__main__":

    test_production_pipeline()
    