import json

from parsing.job_parser import parse_job


job_description = """
We are looking for a Backend Developer.

Requirements:
- Python
- FastAPI
- SQL
- Git
- Docker
- 2 years of backend development experience

Bachelor's degree in Computer Engineering or related field preferred.

Responsibilities:
- Develop backend APIs
- Design database systems
- Maintain scalable applications
"""


print("Parsing job description...")

result = parse_job(job_description)

print("\n===== JOB JSON =====\n")

print(
    json.dumps(
        result,
        indent=4,
        ensure_ascii=False
    )
)