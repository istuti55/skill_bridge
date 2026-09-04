from matching.similarity import exact_skill_match


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


result = exact_skill_match(
    candidate_skills,
    job_skills
)

print(result)