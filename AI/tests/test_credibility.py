import json
from verification.credibility import check_credibility


def test_credibility():
    candidate = {
        "skills": [
            "Python",
            "Django",
            "AWS",
            "Docker"
        ],
        "experience": [
            "Backend Developer at ABC Tech, 2022 - 2024",
            "Software Developer at XYZ, 2023 - 2025"
        ],
        "projects": [
            "Built a Django web application"
        ]
    }

    result = check_credibility(candidate)

    assert isinstance(result, dict)
    assert "status" in result
    assert "verification_required" in result