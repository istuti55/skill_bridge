"""
SkillBridge AI Edge Case & Reliability Evaluation

Tests important AI components against empty, missing,
and unusual inputs to ensure they fail safely.
"""

from matching.matcher import hybrid_match
from intelligence.skill_gap import analyze_required_skill_gap
from intelligence.recommender import generate_career_recommendation


EDGE_CASES = [
    {
        "id": "R1",
        "description": "Empty candidate skills",
        "candidate_skills": [],
        "job_skills": ["python", "sql"],
        "experience": [],
        "projects": [],
        "missing_skills": ["python", "sql"],
    },
    {
        "id": "R2",
        "description": "Empty job skills",
        "candidate_skills": ["python", "sql"],
        "job_skills": [],
        "experience": [],
        "projects": [],
        "missing_skills": [],
    },
    {
        "id": "R3",
        "description": "Both skill lists empty",
        "candidate_skills": [],
        "job_skills": [],
        "experience": [],
        "projects": [],
        "missing_skills": [],
    },
    {
        "id": "R4",
        "description": "Duplicate candidate skills",
        "candidate_skills": [
            "Python",
            "python",
            "PYTHON",
        ],
        "job_skills": [
            "python",
        ],
        "experience": [],
        "projects": [],
        "missing_skills": [],
    },
    {
        "id": "R5",
        "description": "Whitespace and mixed-case skills",
        "candidate_skills": [
            " Python ",
            "SQL",
        ],
        "job_skills": [
            "python",
            "sql",
        ],
        "experience": [],
        "projects": [],
        "missing_skills": [],
    },
    {
        "id": "R6",
        "description": "Empty experience and projects",
        "candidate_skills": [
            "python",
        ],
        "job_skills": [
            "python",
        ],
        "experience": [],
        "projects": [],
        "missing_skills": [],
    },
]


def run_case(case):
    """
    Run all major deterministic AI components for one case.
    """

    hybrid_result = hybrid_match(
        case["candidate_skills"],
        case["job_skills"],
    )

    gap_result = analyze_required_skill_gap(
        case["candidate_skills"],
        case["job_skills"],
    )

    recommendation_result = generate_career_recommendation(
        case["candidate_skills"],
        case["experience"],
        case["projects"],
        case["missing_skills"],
    )

    return {
        "hybrid": hybrid_result,
        "gap": gap_result,
        "recommendation": recommendation_result,
    }


def evaluate_edge_cases():
    total_cases = len(EDGE_CASES)
    passed_cases = 0

    print("\n===== EDGE CASE & RELIABILITY EVALUATION =====\n")

    for case in EDGE_CASES:
        try:
            result = run_case(case)

            valid_hybrid = isinstance(
                result["hybrid"],
                dict
            )

            valid_gap = isinstance(
                result["gap"],
                dict
            )

            valid_recommendation = isinstance(
                result["recommendation"],
                dict
            )

            passed = (
                valid_hybrid
                and valid_gap
                and valid_recommendation
            )

            if passed:
                passed_cases += 1

            status = "PASS" if passed else "FAIL"

            print(
                f"{case['id']} - "
                f"{case['description']}"
            )
            print(f"  Status: {status}")
            print(
                f"  Hybrid result: "
                f"{result['hybrid']}"
            )
            print(
                f"  Skill gap result: "
                f"{result['gap']}"
            )
            print(
                f"  Recommendation result: "
                f"{result['recommendation']}"
            )
            print()

        except Exception as error:
            print(
                f"{case['id']} - "
                f"{case['description']}"
            )
            print("  Status: FAIL")
            print(
                f"  Error: "
                f"{type(error).__name__}: {error}"
            )
            print()

    reliability = (
        passed_cases / total_cases * 100
        if total_cases
        else 0.0
    )

    print("===== EVALUATION SUMMARY =====")
    print(f"Total cases: {total_cases}")
    print(f"Passed cases: {passed_cases}")
    print(
        f"Failed cases: "
        f"{total_cases - passed_cases}"
    )
    print(
        f"Edge-case reliability: "
        f"{reliability:.2f}%"
    )

    return reliability


if __name__ == "__main__":
    evaluate_edge_cases()