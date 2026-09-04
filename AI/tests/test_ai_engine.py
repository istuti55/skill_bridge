import json

from ai_engine import analyze_candidate


pdf_path = "sample_resumes/Resume.pdf"

job_description = """
We are looking for a Python Backend Developer.

Required skills:
Python
FastAPI
SQL
Docker
Git

Preferred skills:
AWS

Minimum experience:
2 years

Education:
Bachelor of Engineering in Computer Engineering

Responsibilities:
Develop backend APIs.
Design database systems.
Build scalable applications.
"""


print("\n===== STARTING SKILLBRIDGE AI =====\n")


result = analyze_candidate(
    pdf_path,
    job_description
)


print("\n===== FINAL AI RESULT =====\n")

print(
    json.dumps(
        result,
        indent=4,
        ensure_ascii=False
    )
)