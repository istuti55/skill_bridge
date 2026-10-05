from intelligence.skill_gap import (
    analyze_required_skill_gap,
    analyze_preferred_skill_gap,
    prioritize_missing_skills,
)


def test_required_all_matched():

    result = analyze_required_skill_gap(
        ["Python", "SQL", "Docker"],
        ["Python", "SQL", "Docker"]
    )

    print("\nRequired - all matched:")
    print(result)

    assert result["matched_skills"] == [
        "docker",
        "python",
        "sql"
    ]

    assert result["missing_skills"] == []

    assert result["skill_gap_percentage"] == 0.0


def test_required_all_missing():

    result = analyze_required_skill_gap(
        [],
        ["Python", "SQL", "Docker"]
    )

    print("\nRequired - all missing:")
    print(result)

    assert result["matched_skills"] == []

    assert result["missing_skills"] == [
        "docker",
        "python",
        "sql"
    ]

    assert result["skill_gap_percentage"] == 100.0


def test_required_empty_job():

    result = analyze_required_skill_gap(
        ["Python", "SQL"],
        []
    )

    print("\nRequired - empty job:")
    print(result)

    assert result["matched_skills"] == []
    assert result["missing_skills"] == []
    assert result["skill_gap_percentage"] == 0.0


def test_required_empty_candidate():

    result = analyze_required_skill_gap(
        [],
        ["Python"]
    )

    print("\nRequired - empty candidate:")
    print(result)

    assert result["matched_skills"] == []
    assert result["missing_skills"] == ["python"]
    assert result["skill_gap_percentage"] == 100.0


def test_required_aliases_and_duplicates():

    result = analyze_required_skill_gap(
        [
            "Python",
            "python",
            "Fast API",
            "fastapi",
            "Postgres"
        ],
        [
            "Python",
            "FastAPI",
            "PostgreSQL"
        ]
    )

    print("\nRequired - aliases and duplicates:")
    print(result)

    assert result["matched_skills"] == [
        "fastapi",
        "postgresql",
        "python"
    ]

    assert result["missing_skills"] == []

    assert result["skill_gap_percentage"] == 0.0


def test_preferred_all_missing():

    result = analyze_preferred_skill_gap(
        [],
        ["AWS", "Kubernetes"]
    )

    print("\nPreferred - all missing:")
    print(result)

    assert result["matched_skills"] == []

    assert result["missing_skills"] == [
        "aws",
        "kubernetes"
    ]

    assert result["skill_gap_percentage"] == 100.0


def test_preferred_empty():

    result = analyze_preferred_skill_gap(
        ["Python"],
        []
    )

    print("\nPreferred - empty:")
    print(result)

    assert result["matched_skills"] == []
    assert result["missing_skills"] == []
    assert result["skill_gap_percentage"] == 0.0


def test_learning_priorities():

    result = prioritize_missing_skills(
        ["FastAPI", "Docker"],
        ["AWS", "Kubernetes"]
    )

    print("\nLearning priorities:")
    print(result)

    assert result == [
        {
            "skill": "fastapi",
            "priority": "high",
            "reason": (
                "Required skill missing from "
                "candidate profile."
            )
        },
        {
            "skill": "docker",
            "priority": "high",
            "reason": (
                "Required skill missing from "
                "candidate profile."
            )
        },
        {
            "skill": "aws",
            "priority": "medium",
            "reason": (
                "Preferred skill missing from "
                "candidate profile."
            )
        },
        {
            "skill": "kubernetes",
            "priority": "medium",
            "reason": (
                "Preferred skill missing from "
                "candidate profile."
            )
        },
    ]


def test_learning_priorities_empty():

    result = prioritize_missing_skills(
        [],
        []
    )

    print("\nLearning priorities - empty:")
    print(result)

    assert result == []


if __name__ == "__main__":

    test_required_all_matched()
    test_required_all_missing()
    test_required_empty_job()
    test_required_empty_candidate()
    test_required_aliases_and_duplicates()
    test_preferred_all_missing()
    test_preferred_empty()
    test_learning_priorities()
    test_learning_priorities_empty()

    print(
        "\n✓ Skill-gap edge-case tests passed"
    )