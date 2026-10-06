from matching.experience_matcher import experience_match
from matching.education_matcher import education_match


def test_experience_edge_cases():

    test_cases = [
        (10, 5, 100.0),
        (5, 5, 100.0),
        (2.5, 5, 50.0),
        (0, 5, 0.0),
        (-5, 5, 0.0),
        ("5", "5", 100.0),
        ("2.5", "5", 50.0),
        ("invalid", 5, 0.0),
        (5, "invalid", 0.0),
        (None, 5, 0.0),
        (5, None, 0.0),
        (5, 0, 100.0),
        (5, -2, 100.0),
    ]

    print("\nExperience edge cases:")

    for candidate, required, expected in test_cases:

        result = experience_match(
            candidate,
            required
        )

        print(
            f"{candidate!r} vs {required!r}"
            f" -> {result}"
        )

        assert result == expected


def test_education_exact_match():

    result = education_match(
        ["Bachelor of Science in Computer Science"],
        ["Bachelor of Science in Computer Science"]
    )

    print("\nExact education match:")
    print(result)

    assert result == 100.0


def test_education_related_match():

    result = education_match(
        ["Bachelor of Science in Computer Science"],
        ["Bachelor of Engineering in Computer Engineering"]
    )

    print("\nRelated education match:")
    print(result)

    assert result == 82.0


def test_education_higher_degree():

    result = education_match(
        ["Master of Science in Computer Science"],
        ["Bachelor of Science in Computer Science"]
    )

    print("\nHigher degree match:")
    print(result)

    assert result == 88.0


def test_education_unrelated_degree():

    result = education_match(
        ["Bachelor of Business Administration"],
        ["Bachelor of Computer Engineering"]
    )

    print("\nUnrelated education match:")
    print(result)

    assert result == 40.0


def test_education_empty_candidate():

    result = education_match(
        [],
        ["Bachelor of Computer Engineering"]
    )

    print("\nEmpty candidate education:")
    print(result)

    assert result == 0.0


def test_education_empty_requirement():

    result = education_match(
        ["Bachelor of Computer Engineering"],
        []
    )

    print("\nEmpty education requirement:")
    print(result)

    assert result == 100.0


if __name__ == "__main__":

    test_experience_edge_cases()
    test_education_exact_match()
    test_education_related_match()
    test_education_higher_degree()
    test_education_unrelated_degree()
    test_education_empty_candidate()
    test_education_empty_requirement()

    print(
        "\n✓ Experience and education "
        "edge-case tests passed"
    )