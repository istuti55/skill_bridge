from intelligence.recommender import (
    detect_career_roles,
    generate_career_recommendation,
)


def test_backend_candidate():

    skills = [
        "Python",
        "SQL",
        "Django",
        "Docker",
    ]

    experience = [
        "Backend developer building REST APIs"
    ]

    education = [
        "Bachelor of Computer Engineering"
    ]

    result = detect_career_roles(
        skills,
        experience,
        education
    )

    print("\nBackend candidate:")
    print(result)

    assert len(result) > 0
    assert result[0]["role"] == "Backend Developer"


def test_frontend_candidate():

    skills = [
        "JavaScript",
        "React",
        "HTML5/CSS3",
    ]

    experience = [
        "Frontend developer building web interfaces"
    ]

    education = [
        "Bachelor of Computer Engineering"
    ]

    result = detect_career_roles(
        skills,
        experience,
        education
    )

    print("\nFrontend candidate:")
    print(result)

    assert len(result) > 0

    assert any(
        item["role"] == "Frontend Developer"
        for item in result
    )


def test_full_stack_candidate():

    skills = [
        "Python",
        "JavaScript",
        "React",
        "SQL",
        "Docker",
    ]

    experience = [
        "Full stack developer building web applications"
    ]

    education = [
        "Bachelor of Computer Engineering"
    ]

    result = detect_career_roles(
        skills,
        experience,
        education
    )

    print("\nFull-stack candidate:")
    print(result)

    assert len(result) > 0

    assert any(
        item["role"] in {
            "Full Stack Developer",
            "Backend Developer"
        }
        for item in result
    )


def test_cloud_devops_candidate():

    skills = [
        "AWS",
        "Docker",
        "Git",
        "CI/CD pipelines",
    ]

    experience = [
        "Cloud engineer managing deployments"
    ]

    education = [
        "Bachelor of Computer Engineering"
    ]

    result = detect_career_roles(
        skills,
        experience,
        education
    )

    print("\nCloud/DevOps candidate:")
    print(result)

    assert len(result) > 0

    assert any(
        item["role"] in {
            "Cloud Engineer",
            "DevOps Engineer"
        }
        for item in result
    )


def test_empty_candidate():

    result = detect_career_roles(
        [],
        [],
        []
    )

    print("\nEmpty candidate:")
    print(result)

    assert isinstance(result, list)


def test_recommendation_with_missing_skill():

    candidate_skills = [
        "Python",
        "SQL",
        "Docker",
    ]

    experience = [
        "2 years backend development"
    ]

    education = [
        "Bachelor of Computer Engineering"
    ]

    missing_skills = [
        "FastAPI"
    ]

    result = generate_career_recommendation(
        candidate_skills,
        experience,
        education,
        missing_skills,
        projects=[],
        learning_priorities=[
            {
                "skill": "fastapi",
                "priority": "high",
                "reason": (
                    "Required skill missing from "
                    "candidate profile."
                )
            }
        ]
    )

    print("\nRecommendation with missing skill:")
    print(result)

    assert isinstance(
        result["recommended_roles"],
        list
    )

    assert isinstance(
        result["skill_priorities"],
        list
    )

    assert isinstance(
        result["learning_path"],
        list
    )

    assert result["reason"]

    assert "fastapi" in result["skill_priorities"]


def test_recommendation_without_missing_skills():

    candidate_skills = [
        "Python",
        "SQL",
        "Docker",
        "Git",
    ]

    experience = [
        "Backend developer"
    ]

    education = [
        "Bachelor of Computer Engineering"
    ]

    result = generate_career_recommendation(
        candidate_skills,
        experience,
        education,
        [],
        projects=[],
        learning_priorities=[]
    )

    print("\nRecommendation without missing skills:")
    print(result)

    assert isinstance(
        result["recommended_roles"],
        list
    )

    assert result["skill_priorities"] == []

    assert result["learning_path"] == []

    assert result["reason"]


def test_recommendation_empty_candidate():

    result = generate_career_recommendation(
        [],
        [],
        [],
        [],
        projects=[],
        learning_priorities=[]
    )

    print("\nEmpty candidate recommendation:")
    print(result)

    assert isinstance(
        result["recommended_roles"],
        list
    )

    assert isinstance(
        result["skill_priorities"],
        list
    )

    assert isinstance(
        result["learning_path"],
        list
    )

    assert isinstance(
        result["reason"],
        str
    )


if __name__ == "__main__":

    test_backend_candidate()
    test_frontend_candidate()
    test_full_stack_candidate()
    test_cloud_devops_candidate()
    test_empty_candidate()
    test_recommendation_with_missing_skill()
    test_recommendation_without_missing_skills()
    test_recommendation_empty_candidate()

    print(
        "\n✓ Career recommendation "
        "edge-case tests passed"
    )