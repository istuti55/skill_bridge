import json

from core.ollama_client import call_ollama


def generate_career_recommendation(
    candidate_skills,
    experience,
    education,
    missing_skills
):
    prompt = f"""
You are a career advisor for SkillBridge.

Analyze this candidate and provide practical career recommendations.

Candidate Skills:
{candidate_skills}

Experience:
{experience}

Education:
{education}

Missing Skills:
{missing_skills}

Return ONLY valid JSON using this structure:

{{
    "recommended_roles": [],
    "skill_priorities": [],
    "learning_path": [],
    "reason": ""
}}

Rules:
- Recommend roles that realistically match the candidate.
- Prioritize missing skills that are useful for those roles.
- Do not invent candidate experience.
- Keep recommendations practical.
- Return valid JSON only.
"""

    response = call_ollama(prompt)

    start = response.find("{")
    end = response.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("No JSON found in Ollama response.")

    json_text = response[start:end + 1]

    return json.loads(json_text)