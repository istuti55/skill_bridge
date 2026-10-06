import json

from ai_engine import analyze_candidate


RESUME_PATH = "sample_resumes/Resume.pdf"


NORMAL_JOB = """
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


JOB_WITHOUT_PREFERRED = """
We are looking for a Python Backend Developer.

Required skills:
Python
FastAPI
SQL

Minimum experience:
2 years

Education:
Bachelor of Engineering in Computer Engineering

Responsibilities:
Develop backend APIs.
Design database systems.
"""


JOB_WITH_EMPTY_SKILLS = """
We are looking for a Software Developer.

Minimum experience:
0 years

Responsibilities:
Develop software applications.
"""


def run_normal_pipeline():
    return analyze_candidate(
        RESUME_PATH,
        NORMAL_JOB
    )


def run_no_preferred_pipeline():
    return analyze_candidate(
        RESUME_PATH,
        JOB_WITHOUT_PREFERRED
    )


def run_empty_skills_pipeline():
    return analyze_candidate(
        RESUME_PATH,
        JOB_WITH_EMPTY_SKILLS
    )


def test_normal_full_pipeline():

    result = run_normal_pipeline()

    print("\n===== NORMAL FULL PIPELINE =====")

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False
        )
    )

    assert isinstance(result, dict)

    assert "candidate" in result
    assert "job" in result
    assert "credibility" in result
    assert "matching" in result
    assert "skill_gap" in result
    assert "career_recommendation" in result


def test_final_result_structure():

    result = run_normal_pipeline()

    print("\n===== FINAL RESULT STRUCTURE =====")

    assert isinstance(
        result["candidate"],
        dict
    )

    assert isinstance(
        result["job"],
        dict
    )

    assert isinstance(
        result["credibility"],
        dict
    )

    assert isinstance(
        result["matching"],
        dict
    )

    assert isinstance(
        result["skill_gap"],
        dict
    )

    assert isinstance(
        result["career_recommendation"],
        dict
    )

    skill_gap = result["skill_gap"]

    assert "required" in skill_gap
    assert "preferred" in skill_gap
    assert "learning_priorities" in skill_gap

    recommendation = result[
        "career_recommendation"
    ]

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

    print("✓ Final result structure valid")


def test_matching_score_bounds():

    result = run_normal_pipeline()

    matching = result["matching"]

    print("\n===== MATCHING SCORE CHECK =====")

    score_fields = [
        "overall_score",
        "skills_score",
        "experience_score",
        "education_score"
    ]

    for field in score_fields:

        assert field in matching

        score = matching[field]

        print(
            f"{field}: {score}"
        )

        assert 0 <= score <= 100


def test_skill_gap_bounds():

    result = run_normal_pipeline()

    skill_gap = result["skill_gap"]

    required = skill_gap["required"]
    preferred = skill_gap["preferred"]

    print("\n===== SKILL GAP CHECK =====")

    assert 0 <= (
        required["skill_gap_percentage"]
    ) <= 100

    assert 0 <= (
        preferred["skill_gap_percentage"]
    ) <= 100

    print(
        "Required gap:",
        required["skill_gap_percentage"]
    )

    print(
        "Preferred gap:",
        preferred["skill_gap_percentage"]
    )


def test_no_preferred_skills():

    result = run_no_preferred_pipeline()

    print("\n===== NO PREFERRED SKILLS =====")

    preferred = result[
        "skill_gap"
    ]["preferred"]

    print(preferred)

    assert preferred[
        "matched_skills"
    ] == []

    assert preferred[
        "missing_skills"
    ] == []

    assert preferred[
        "skill_gap_percentage"
    ] == 0.0


def test_empty_job_skills():

    result = run_empty_skills_pipeline()

    print("\n===== EMPTY JOB SKILLS =====")

    required = result[
        "skill_gap"
    ]["required"]

    preferred = result[
        "skill_gap"
    ]["preferred"]

    print(
        "Required:",
        required
    )

    print(
        "Preferred:",
        preferred
    )

    assert required[
        "matched_skills"
    ] == []

    assert required[
        "missing_skills"
    ] == []

    assert required[
        "skill_gap_percentage"
    ] == 0.0

    assert preferred[
        "matched_skills"
    ] == []

    assert preferred[
        "missing_skills"
    ] == []

    assert preferred[
        "skill_gap_percentage"
    ] == 0.0


def test_credibility_structure():

    result = run_normal_pipeline()

    credibility = result[
        "credibility"
    ]

    print("\n===== CREDIBILITY CHECK =====")

    required_fields = [
        "status",
        "timeline_issues",
        "strong_evidence",
        "weak_evidence",
        "unsupported_skills",
        "duplicate_skills",
        "verification_required"
    ]

    for field in required_fields:

        assert field in credibility

    assert isinstance(
        credibility[
            "verification_required"
        ],
        bool
    )

    print(
        "Status:",
        credibility["status"]
    )

    print(
        "Verification required:",
        credibility[
            "verification_required"
        ]
    )


def test_learning_priority_consistency():

    result = run_normal_pipeline()

    skill_gap = result[
        "skill_gap"
    ]

    priorities = skill_gap[
        "learning_priorities"
    ]

    recommendation = result[
        "career_recommendation"
    ]

    recommendation_priorities = (
        recommendation[
            "skill_priorities"
        ]
    )

    print(
        "\n===== LEARNING PRIORITY CHECK ====="
    )

    print(
        "Deterministic priorities:",
        priorities
    )

    print(
        "Recommendation priorities:",
        recommendation_priorities
    )

    expected_skills = [
        item["skill"]
        for item in priorities
    ]

    assert (
        recommendation_priorities
        == expected_skills
    )


def test_learning_path_consistency():

    result = run_normal_pipeline()

    priorities = result[
        "skill_gap"
    ]["learning_priorities"]

    learning_path = result[
        "career_recommendation"
    ]["learning_path"]

    print(
        "\n===== LEARNING PATH CHECK ====="
    )

    priority_skills = [
        item["skill"]
        for item in priorities
    ]

    path_skills = [
        item["skill"]
        for item in learning_path
    ]

    print(
        "Priority skills:",
        priority_skills
    )

    print(
        "Learning path skills:",
        path_skills
    )

    assert path_skills == priority_skills


if __name__ == "__main__":

    print(
        "\nRunning optimized AI-engine "
        "edge-case validation..."
    )

    # Run normal pipeline once.
    normal_result = run_normal_pipeline()

    print("\n===== NORMAL PIPELINE CHECK =====")

    assert isinstance(
        normal_result,
        dict
    )

    assert "candidate" in normal_result
    assert "job" in normal_result
    assert "credibility" in normal_result
    assert "matching" in normal_result
    assert "skill_gap" in normal_result
    assert "career_recommendation" in normal_result

    # Run no-preferred case once.
    no_preferred_result = (
        run_no_preferred_pipeline()
    )

    print(
        "\n===== NO PREFERRED PIPELINE CHECK ====="
    )

    preferred = no_preferred_result[
        "skill_gap"
    ]["preferred"]

    assert preferred[
        "matched_skills"
    ] == []

    assert preferred[
        "missing_skills"
    ] == []

    assert preferred[
        "skill_gap_percentage"
    ] == 0.0

    # Run empty-skills case once.
    empty_skills_result = (
        run_empty_skills_pipeline()
    )

    print(
        "\n===== EMPTY SKILLS PIPELINE CHECK ====="
    )

    required = empty_skills_result[
        "skill_gap"
    ]["required"]

    preferred = empty_skills_result[
        "skill_gap"
    ]["preferred"]

    assert required[
        "matched_skills"
    ] == []

    assert required[
        "missing_skills"
    ] == []

    assert required[
        "skill_gap_percentage"
    ] == 0.0

    assert preferred[
        "matched_skills"
    ] == []

    assert preferred[
        "missing_skills"
    ] == []

    assert preferred[
        "skill_gap_percentage"
    ] == 0.0

    print(
        "\n✓ Full AI-engine edge-case tests passed"
    )