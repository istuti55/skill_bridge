import json

from intelligence.recommender import generate_career_recommendation


candidate_skills = [
    "Python",
    "Django",
    "SQL",
    "Docker",
    "AWS"
]

experience = [
    "2 years backend development"
]

education = [
    "Bachelor of Engineering in Computer Engineering"
]

missing_skills = [
    "FastAPI"
]

learning_priorities = [
    {
        "skill": "FastAPI",
        "priority": "high",
        "reason": "Required skill missing from candidate profile."
    }
]


result = generate_career_recommendation(
    candidate_skills,
    experience,
    education,
    missing_skills,
    learning_priorities=learning_priorities
)


print("\n===== CAREER RECOMMENDATION =====\n")

print(
    json.dumps(
        result,
        indent=4,
        ensure_ascii=False
    )
)