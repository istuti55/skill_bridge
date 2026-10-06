from pathlib import Path
import pytest
from ai_engine import analyze_candidate

SAMPLE_RESUME_PATH = Path(__file__).resolve().parent.parent / "sample_resumes" / "Resume.pdf"

@pytest.mark.ollama
def test_ai_analyze_candidate():
    result = analyze_candidate(
        str(SAMPLE_RESUME_PATH),
        """
        Looking for Python Backend Developer.
        Required:
        Python, FastAPI, Docker, AWS
        """
    )
    assert isinstance(result, dict)
    assert "candidate" in result
