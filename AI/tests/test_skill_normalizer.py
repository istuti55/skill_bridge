from matching.skill_normalizer import normalize_skill, normalize_skills


print("===== SKILL NORMALIZER TEST =====")

test_skills = [
    "Python",
    "PYTHON",
    "AWS (S3, EC2, Lambda)",
    "Fast API",
    "FastAPI",
    "JavaScript (ES6+)",
    "JS",
    "Postgres",
    "RESTful APIs",
    "Docker",
    "Git"
]

print("\nIndividual normalization:")

for skill in test_skills:
    print(f"{skill} -> {normalize_skill(skill)}")


print("\nList normalization:")

result = normalize_skills(test_skills)

print(result)