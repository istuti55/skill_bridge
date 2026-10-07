from decouple import config
from ollama import Client

OLLAMA_HOST = config("OLLAMA_HOST", default="http://127.0.0.1:11434")
DEFAULT_MODEL = config("OLLAMA_MODEL", default="llama3.2:latest")
OLLAMA_TIMEOUT = config("OLLAMA_TIMEOUT", default=300.0, cast=float)

client = Client(host=OLLAMA_HOST, timeout=OLLAMA_TIMEOUT)


class AIServiceError(Exception):
    """Raised when Ollama is down or returns nothing useful."""


def call_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    response = client.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}],
    )
    return response["message"]["content"]


def generate_gap_narrative(job_title, strong, weak, missing):
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
        text = call_ollama(prompt).strip()
    except Exception as exc:
        raise AIServiceError(f"Could not get an answer from Ollama: {exc}") from exc

    if not text:
        raise AIServiceError("The AI service returned an empty response.")
    return text