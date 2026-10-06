from matching.matcher import hybrid_match


def test_matcher():
    candidate_skills = [
        "Python",
        "Django",
        "SQL",
        "Git",
        "Docker"
    ]

    job_skills = [
        "Python",
        "FastAPI",
        "SQL",
        "Docker"
    ]

    result = hybrid_match(
        candidate_skills,
        job_skills
    )

    assert isinstance(result, dict)
    assert "hybrid_score" in result