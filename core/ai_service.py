import json

import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"
OLLAMA_TIMEOUT = 120  # seconds


class AIServiceError(Exception):
    """Raised when Ollama is down, too slow, or returns unusable data."""


def extract_cv_data(resume_text):
    """
    Sends resume text to Ollama and returns structured data:
    skills, education, experience_years, certifications.
    Raises AIServiceError if anything goes wrong.
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

    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=OLLAMA_TIMEOUT,
        )
        response.raise_for_status()
        raw_text = response.json().get("response", "").strip()
    except requests.exceptions.Timeout:
        raise AIServiceError("The AI service took too long to respond.")
    except requests.exceptions.RequestException:
        raise AIServiceError("The AI service is not available. Make sure Ollama is running.")
    except ValueError:
        raise AIServiceError("The AI service returned an invalid response.")

    # The model sometimes wraps the JSON in text or ```json fences.
    # Take everything from the first { to the last }.
    start = raw_text.find("{")
    end = raw_text.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise AIServiceError("Could not read the AI response.")

    try:
        data = json.loads(raw_text[start:end + 1])
    except json.JSONDecodeError:
        raise AIServiceError("Could not parse the AI response.")

    if not isinstance(data, dict):
        raise AIServiceError("Could not parse the AI response.")

    return data