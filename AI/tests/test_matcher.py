from matching.matcher import hybrid_match


candidate_skills = [
    "Python",
    "Django",
    "SQL",
    "Git",
    "Docker"
]

job_skills = [
    "Python",
    "FastAPI",
    "SQL",
    "Docker"
]


result = hybrid_match(
    candidate_skills,
    job_skills
)

print("\n===== HYBRID MATCH RESULT =====\n")

print(result)