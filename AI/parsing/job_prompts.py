JOB_PROMPT = """
You are an expert job description parser.

Extract job information.

Return ONLY valid JSON.

Schema:

{{
    "job_title": "",
    "company": "",
    "required_skills": [
        "skill1",
        "skill2"
    ],
    "experience_required": "",
    "education_required": "",
    "responsibilities": []
}}

Rules:
- Extract all technical skills.
- Include programming languages, frameworks, databases, cloud tools, and technologies.
- required_skills must never be empty if skills are mentioned.
- Return only JSON.
- No explanation.
- No markdown.

Job Description:

{job}
"""