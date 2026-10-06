import json

import requests
from django.conf import settings


OLLAMA_URL = getattr(
    settings,
    "OLLAMA_URL",
    "http://127.0.0.1:11434/api/generate"
)

OLLAMA_MODEL = getattr(
    settings,
    "OLLAMA_MODEL",
    "llama3.2:latest"
)

OLLAMA_TIMEOUT = 300  # seconds


class AIServiceError(Exception):
    """Raised when Ollama is down, too slow, or returns unusable data."""


def extract_cv_data(resume_text):
    """
    Sends resume text to Ollama and returns structured data:
    skills, education, experience_years, certifications.
    """

    prompt = f"""
You are a resume parser.

Extract structured data from the resume text below.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations.

Use exactly this format:

{{
  "skills": [
    {{"name": "Python", "level": "strong"}}
  ],
  "education": [
    {{"degree": "BE Computer Engineering", "year": 2026}}
  ],
  "experience_years": 1.5,
  "certifications": [
    "AWS Cloud Practitioner"
  ]
}}

Resume text:
{resume_text}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=OLLAMA_TIMEOUT,
        )

        response.raise_for_status()

        raw_text = response.json().get("response", "").strip()

    except requests.exceptions.Timeout as exc:
        raise AIServiceError(
            "The AI service took too long to respond."
        ) from exc

    except requests.exceptions.RequestException as exc:
        raise AIServiceError(
            f"Could not connect to Ollama: {exc}"
        ) from exc

    except ValueError as exc:
        raise AIServiceError(
            "The AI service returned an invalid response."
        ) from exc

    if not raw_text:
        raise AIServiceError(
            "The AI service returned an empty response."
        )

    # Find JSON inside the model response.
    start = raw_text.find("{")
    end = raw_text.rfind("}")

    if start == -1 or end == -1 or end < start:
        raise AIServiceError(
            f"Could not read the AI response: {raw_text[:500]}"
        )

    json_text = raw_text[start:end + 1]

    try:
        data = json.loads(json_text)

    except json.JSONDecodeError as exc:
        raise AIServiceError(
            f"Could not parse the AI response: {raw_text[:500]}"
        ) from exc

    if not isinstance(data, dict):
        raise AIServiceError(
            "Could not parse the AI response."
        )

    return data


def generate_gap_narrative(job_title, strong, weak, missing):
    """Generate a short career skill-gap summary using Ollama."""

    prompt = f"""
You are a career coach.

Write a short summary of 3 to 4 sentences about how ready a candidate
is for the job "{job_title}".

Strong skills:
{strong or 'none'}

Skills needing more depth:
{weak or 'none'}

Missing skills:
{missing or 'none'}

Be encouraging but honest.
Do not invent skills or experience.
Return plain text only.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=OLLAMA_TIMEOUT,
        )

        response.raise_for_status()

        text = response.json().get("response", "").strip()

    except requests.exceptions.Timeout as exc:
        raise AIServiceError(
            "The AI service took too long to respond."
        ) from exc

    except requests.exceptions.RequestException as exc:
        raise AIServiceError(
            f"Could not connect to Ollama: {exc}"
        ) from exc

    except ValueError as exc:
        raise AIServiceError(
            "The AI service returned an invalid response."
        ) from exc

    if not text:
        raise AIServiceError(
            "The AI service returned an empty response."
        )

    return text