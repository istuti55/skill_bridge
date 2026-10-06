import json
from pathlib import Path
import pytest
from ai_engine import analyze_candidate

SAMPLE_RESUME_PATH = Path(__file__).resolve().parent.parent / "sample_resumes" / "Resume.pdf"


@pytest.mark.ollama
def test_ai_engine():
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

    result = analyze_candidate(
        str(SAMPLE_RESUME_PATH),
        job_description
    )

    assert isinstance(result, dict)
    assert "candidate" in result
    assert "job" in result
    assert "credibility" in result
    assert "matching" in result