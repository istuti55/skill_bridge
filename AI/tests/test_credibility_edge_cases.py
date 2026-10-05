from verification.credibility import (
    check_timeline,
    check_skill_consistency,
    check_keyword_stuffing,
    check_credibility,
)


def test_timeline_no_overlap():

    experience = [
        "Software Engineer 2023 2025",
        "Junior Developer 2020 2022",
    ]

    result = check_timeline(experience)

    print("\nTimeline - no overlap:")
    print(result)

    assert result == []


def test_timeline_overlap():

    experience = [
        "Software Engineer 2022 2025",
        "Developer 2023 2024",
    ]

    result = check_timeline(experience)

    print("\nTimeline - overlap:")
    print(result)

    assert len(result) == 1

    assert (
        result[0]
        == "Potentially overlapping employment periods detected."
    )


def test_skill_strong_evidence():

    skills = [
        "Python",
        "Django",
        "Docker",
    ]

    experience = [
        "Developed backend applications using Python and Django.",
        "Built Docker containers for deployment.",
    ]

    projects = []

    result = check_skill_consistency(
        skills,
        experience,
        projects
    )

    print("\nStrong skill evidence:")
    print(result)

    assert result["strong_evidence"] == [
        "Python",
        "Django",
        "Docker",
    ]

    assert result["weak_evidence"] == []
    assert result["unsupported_skills"] == []


def test_skill_weak_evidence():

    skills = [
        "Python",
        "SQL",
        "AWS",
    ]

    experience = [
        "Worked on backend development.",
        "Managed cloud deployment.",
        "Worked with databases.",
    ]

    projects = []

    result = check_skill_consistency(
        skills,
        experience,
        projects
    )

    print("\nWeak skill evidence:")
    print(result)

    assert result["strong_evidence"] == []

    assert result["weak_evidence"] == [
        "SQL",
        "AWS",
    ]

    assert result["unsupported_skills"] == [
        "Python",
    ]


def test_unsupported_skills():

    skills = [
        "Python",
        "Kubernetes",
    ]

    experience = [
        "Worked on frontend development.",
    ]

    projects = []

    result = check_skill_consistency(
        skills,
        experience,
        projects
    )

    print("\nUnsupported skills:")
    print(result)

    assert result["strong_evidence"] == []

    assert result["weak_evidence"] == []

    assert result["unsupported_skills"] == [
        "Python",
        "Kubernetes",
    ]


def test_duplicate_skills():

    skills = [
        "Python",
        "python",
        "Python",
        "SQL",
    ]

    result = check_keyword_stuffing(skills)

    print("\nDuplicate skills:")
    print(result)

    assert result == [
        "python"
    ]


def test_clean_credibility():

    candidate = {
        "skills": [
            "Python",
            "Django",
        ],
        "experience": [
            "Built applications using Python and Django."
        ],
        "projects": []
    }

    result = check_credibility(candidate)

    print("\nClean credibility:")
    print(result)

    assert result["verification_required"] is False

    assert result["timeline_issues"] == []

    assert result["unsupported_skills"] == []

    assert result["duplicate_skills"] == []


def test_credibility_with_issues():

    candidate = {
        "skills": [
            "Python",
            "Kubernetes",
            "Python",
        ],
        "experience": [
            "Software Engineer 2022 2025",
            "Developer 2023 2024",
        ],
        "projects": []
    }

    result = check_credibility(candidate)

    print("\nCredibility with issues:")
    print(result)

    assert result["verification_required"] is True

    assert len(result["timeline_issues"]) == 1

    assert result["unsupported_skills"] == [
    "Python",
    "Kubernetes",
    "Python"
    ]

    assert result["duplicate_skills"] == [
        "python"
    ]


def test_empty_candidate():

    candidate = {}

    result = check_credibility(candidate)

    print("\nEmpty candidate:")
    print(result)

    assert result["verification_required"] is False

    assert result["timeline_issues"] == []

    assert result["strong_evidence"] == []

    assert result["weak_evidence"] == []

    assert result["unsupported_skills"] == []

    assert result["duplicate_skills"] == []


if __name__ == "__main__":

    test_timeline_no_overlap()
    test_timeline_overlap()
    test_skill_strong_evidence()
    test_skill_weak_evidence()
    test_unsupported_skills()
    test_duplicate_skills()
    test_clean_credibility()
    test_credibility_with_issues()
    test_empty_candidate()

    print(
        "\n✓ Credibility edge-case tests passed"
    )