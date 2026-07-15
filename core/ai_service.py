import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"


def extract_cv_data(resume_text):
    """
    Sends resume text to Ollama and returns structured JSON:
    skills, education, experience, certifications.
    """
    prompt = f"""
You are a resume parser. Extract structured data from the resume text below.
Return ONLY valid JSON, no explanation, no markdown, in this exact format:

{{
  "skills": [{{"name": "Python", "level": "strong"}}],
  "education": [{{"degree": "BE Computer Engineering", "year": 2026}}],
  "experience_years": 1.5,
  "certifications": ["AWS Cloud Practitioner"]
}}

Resume text:
{resume_text}
"""

    response = requests.post(OLLAMA_URL, json={
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    })

    result = response.json()
    raw_text = result.get("response", "").strip()

    # Clean up in case the model wraps it in ```json ... ```
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        raw_text = raw_text.replace("json", "", 1).strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        return {"error": "Could not parse AI response", "raw": raw_text}