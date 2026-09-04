from matching.matcher import complete_match


candidate_skills = [
    "Python",
    "Django",
    "SQL",
    "Docker"
]

job_skills = [
    "Python",
    "FastAPI",
    "SQL",
    "Docker"
]

candidate_experience = 2
required_experience = 2

candidate_education = [
    "Bachelor of Engineering in Computer Engineering"
]

required_education = [
    "Bachelor of Engineering Computer Engineering"
]


result = complete_match(
    candidate_skills,
    job_skills,
    candidate_experience,
    required_experience,
    candidate_education,
    required_education
)


print("\n===== FINAL MATCH RESULT =====\n")

print(result)