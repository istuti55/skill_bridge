from matching.education_matcher import education_match


def test_education():
    candidate_education = [
        "Bachelor of Engineering in Computer Engineering"
    ]

    required_education = [
        "Bachelor of Engineering Computer Engineering"
    ]

    score = education_match(
        candidate_education,
        required_education
    )

    assert isinstance(score, (int, float))
    assert score > 0