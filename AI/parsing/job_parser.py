import json

from llm.ollama_client import call_ollama


def parse_job(job_description: str) -> dict:

    prompt = f"""
You are a professional job-description parser for SkillBridge.

Extract the requirements from the job description.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "job_title": "",
    "required_skills": [],
    "preferred_skills": [],
    "minimum_experience": 0,
    "education": [],
    "responsibilities": []
}}

Rules:
- Do not invent information.
- Keep each skill as a separate item.
- Required skills are explicitly necessary skills.
- Preferred skills are optional or desirable skills.
- Return valid JSON only.

JOB DESCRIPTION:
{job_description}
"""

    response = call_ollama(prompt)

    start = response.find("{")
    end = response.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("No JSON found in Ollama response.")

    json_text = response[start:end + 1]

    return json.loads(json_text)