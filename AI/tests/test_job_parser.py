import json
import pytest
from parsing.job_parser import parse_job


@pytest.mark.ollama
def test_job_parser():
    job_description = """
    We are looking for a Backend Developer.

    Requirements:
    - Python
    - FastAPI
    - SQL
    - Git
    - Docker
    - 2 years of backend development experience

    Bachelor's degree in Computer Engineering or related field preferred.

    Responsibilities:
    - Develop backend APIs
    - Design database systems
    - Maintain scalable applications
    """

    result = parse_job(job_description)

    assert isinstance(result, dict)
    assert "required_skills" in result