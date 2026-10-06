"""
SkillBridge AI Evaluation Dataset

Ground-truth cases for evaluating:
- Skill matching
- Skill-gap detection
- Career recommendation relevance

This dataset contains expected outcomes and does not call Ollama.
"""


EVALUATION_CASES = [
    {
        "id": "E1",
        "description": "Partial backend skill match",
        "candidate_skills": [
            "Python",
            "SQL",
            "Docker",
        ],
        "job_skills": [
            "Python",
            "SQL",
            "FastAPI",
        ],
        "expected": {
            "matched_skills": [
                "python",
                "sql",
            ],
            "missing_skills": [
                "fastapi",
            ],
        },
    },
    {
        "id": "E2",
        "description": "Complete backend skill match",
        "candidate_skills": [
            "Python",
            "Django",
            "PostgreSQL",
        ],
        "job_skills": [
            "Python",
            "Django",
            "PostgreSQL",
        ],
        "expected": {
            "matched_skills": [
                "django",
                "postgresql",
                "python",
            ],
            "missing_skills": [],
        },
    },
    {
        "id": "E3",
        "description": "Low-overlap backend mismatch",
        "candidate_skills": [
            "Java",
            "Spring",
            "MySQL",
        ],
        "job_skills": [
            "Python",
            "FastAPI",
            "PostgreSQL",
        ],
        "expected": {
            "matched_skills": [],
            "missing_skills": [
                "fastapi",
                "postgresql",
                "python",
            ],
        },
    },
    {
        "id": "E4",
        "description": "Cloud and DevOps partial match",
        "candidate_skills": [
            "AWS",
            "Docker",
            "Linux",
        ],
        "job_skills": [
            "AWS",
            "Docker",
            "Kubernetes",
        ],
        "expected": {
            "matched_skills": [
                "aws",
                "docker",
            ],
            "missing_skills": [
                "kubernetes",
            ],
        },
    },
    {
        "id": "E5",
        "description": "Strong frontend skill match",
        "candidate_skills": [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
        ],
        "job_skills": [
            "JavaScript",
            "React",
            "CSS",
        ],
        "expected": {
            "matched_skills": [
                "css",
                "javascript",
                "react",
            ],
            "missing_skills": [],
        },
    },
]