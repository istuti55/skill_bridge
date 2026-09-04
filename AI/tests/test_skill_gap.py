from intelligence.skill_gap import analyze_skill_gap


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
    "Docker",
    "AWS"
]


result = analyze_skill_gap(
    candidate_skills,
    job_skills
)

print("\n===== SKILL GAP =====\n")
print(result)