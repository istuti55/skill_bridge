"""
SkillBridge AI Career Recommendation Evaluation

Evaluates career recommendations against expected relevant roles.
"""

from intelligence.recommender import generate_career_recommendation


CAREER_EVALUATION_CASES = [
    {
        "id": "C1",
        "description": "Python backend candidate",
        "candidate_skills": [
            "python",
            "fastapi",
            "sql",
            "postgresql",
            "docker",
        ],
        "experience": [
            "2 years of backend development experience"
        ],
        "projects": [
            "Built Python backend APIs using FastAPI and PostgreSQL"
        ],
        "education": [
            "Bachelor of Engineering in Computer Engineering"
        ],
        "missing_skills": [
            "aws"
        ],
        "expected_roles": [
            "Backend Developer",
        ],
    },
    {
        "id": "C2",
        "description": "Cloud and DevOps candidate",
        "candidate_skills": [
            "aws",
            "docker",
            "kubernetes",
            "linux",
            "terraform",
        ],
        "experience": [
            "3 years of cloud and DevOps experience"
        ],
        "projects": [
            "Built AWS cloud infrastructure using Docker and Kubernetes"
        ],
        "education": [
            "Bachelor of Engineering in Computer Engineering"
        ],
        "missing_skills": [
            "jenkins"
        ],
        "expected_roles": [
            "Cloud Engineer",
            "DevOps Engineer",
        ],
    },
    {
        "id": "C3",
        "description": "Frontend candidate",
        "candidate_skills": [
            "html",
            "css",
            "javascript",
            "react",
        ],
        "experience": [
            "1 year of frontend development experience"
        ],
        "projects": [
            "Built responsive web interfaces using React and JavaScript"
        ],
        "education": [
            "Bachelor of Engineering in Computer Engineering"
        ],
        "missing_skills": [
            "typescript"
        ],
        "expected_roles": [
            "Frontend Developer",
        ],
    },
]


def evaluate_career_recommendations():
    total_cases = len(CAREER_EVALUATION_CASES)
    passed_cases = 0

    print("\n===== CAREER RECOMMENDATION EVALUATION =====\n")

    for case in CAREER_EVALUATION_CASES:
        result = generate_career_recommendation(
            case["candidate_skills"],
            case["experience"],
            case["projects"],
            case["missing_skills"],
        )

        actual_roles = result.get(
            "recommended_roles",
            []
        )

        expected_roles = case["expected_roles"]

        matched_roles = [
            role
            for role in expected_roles
            if role in actual_roles
        ]

        passed = (
            len(matched_roles)
            == len(expected_roles)
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
            f"  Expected roles: "
            f"{expected_roles}"
        )
        print(
            f"  Actual roles:   "
            f"{actual_roles}"
        )
        print(
            f"  Matched expected roles: "
            f"{matched_roles}"
        )
        print()

    accuracy = (
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
        f"Career recommendation accuracy: "
        f"{accuracy:.2f}%"
    )

    return accuracy


if __name__ == "__main__":
    evaluate_career_recommendations()