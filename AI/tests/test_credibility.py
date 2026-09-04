import json

from verification.credibility import check_credibility


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

print("\n===== CREDIBILITY REPORT =====\n")

print(
    json.dumps(
        result,
        indent=4,
        ensure_ascii=False
    )
)