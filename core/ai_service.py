import json

import requests
from django.conf import settings

# Configured in .env (see settings.py): OLLAMA_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT
OLLAMA_URL = getattr(settings, 'OLLAMA_URL', "http://localhost:11434/api/generate")
OLLAMA_MODEL = getattr(settings, 'OLLAMA_MODEL', "llama3.2:latest")
OLLAMA_TIMEOUT = getattr(settings, 'OLLAMA_TIMEOUT', 120)  # seconds


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
def generate_gap_narrative(job_title, strong, weak, missing):
    """Short friendly summary of a skill gap report. Raises AIServiceError if AI is down."""
    prompt = f"""
You are a career coach. Write a short summary (3 to 4 sentences, plain text, no lists)
of how ready a candidate is for the job "{job_title}".

Skills the candidate is strong in: {strong or 'none'}
Skills where the candidate needs more depth: {weak or 'none'}
Skills the candidate is missing: {missing or 'none'}

Be encouraging but honest. Do not invent skills or experience.
"""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=OLLAMA_TIMEOUT,
        )
        response.raise_for_status()
        text = response.json().get("response", "").strip()
    except requests.exceptions.Timeout:
        raise AIServiceError("The AI service took too long to respond.")
    except requests.exceptions.RequestException:
        raise AIServiceError("The AI service is not available. Make sure Ollama is running.")
    except ValueError:
        raise AIServiceError("The AI service returned an invalid response.")

    if not text:
        raise AIServiceError("The AI service returned an empty response.")
    return text