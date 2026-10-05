from matching.similarity import exact_skill_match
from matching.experience_matcher import experience_match


def test_exact_skill_match():

    # Normal matching
    result = exact_skill_match(
        ["Python", "SQL", "Docker"],
        ["Python", "SQL", "FastAPI"]
    )

    print("\nNormal matching:")
    print(result)

    assert result["matched_skills"] == [
        "python",
        "sql"
    ]

    assert result["missing_skills"] == [
        "fastapi"
    ]

    assert result["score"] == 66.67


def test_exact_skill_match_with_aliases():

    result = exact_skill_match(
        ["Python", "Fast API", "Postgres"],
        ["python", "FastAPI", "PostgreSQL"]
    )

    print("\nAlias matching:")
    print(result)

    assert result["matched_skills"] == [
        "fastapi",
        "postgresql",
        "python"
    ]

    assert result["missing_skills"] == []

    assert result["score"] == 100.0


def test_exact_skill_match_empty_job():

    result = exact_skill_match(
        ["Python", "SQL"],
        []
    )

    print("\nEmpty job skills:")
    print(result)

    assert result["matched_skills"] == []
    assert result["missing_skills"] == []
    assert result["score"] == 0.0


def test_exact_skill_match_empty_candidate():

    result = exact_skill_match(
        [],
        ["Python", "SQL"]
    )

    print("\nEmpty candidate skills:")
    print(result)

    assert result["matched_skills"] == []
    assert result["missing_skills"] == [
        "python",
        "sql"
    ]

    assert result["score"] == 0.0


def test_exact_skill_match_duplicates():

    result = exact_skill_match(
        ["Python", "python", "PYTHON"],
        ["Python"]
    )

    print("\nDuplicate candidate skills:")
    print(result)

    assert result["matched_skills"] == ["python"]
    assert result["missing_skills"] == []
    assert result["score"] == 100.0


def test_experience_matching():

    test_cases = [
        (5, 2, 100.0),
        (2, 2, 100.0),
        (1, 2, 50.0),
        (0, 2, 0.0),
        (-1, 2, 0.0),
        (None, 2, 0.0),
        (2, None, 0.0),
        (2, 0, 100.0),
        (2, -1, 100.0),
    ]

    print("\nExperience matching:")

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


if __name__ == "__main__":

    test_exact_skill_match()
    test_exact_skill_match_with_aliases()
    test_exact_skill_match_empty_job()
    test_exact_skill_match_empty_candidate()
    test_exact_skill_match_duplicates()
    test_experience_matching()

    print("\n✓ Matching edge-case tests passed")