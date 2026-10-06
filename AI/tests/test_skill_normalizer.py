from matching.skill_normalizer import normalize_skill, normalize_skills


def test_normalize_skill():

    test_cases = [
        (" Python ", "python"),
        ("PYTHON", "python"),
        ("python", "python"),

        ("Fast API", "fastapi"),
        ("Fast-API", "fastapi"),
        ("fast_api", "fastapi"),

        ("JavaScript", "javascript"),
        ("JS", "javascript"),
        ("JavaScript (ES6+)", "javascript"),

        ("TypeScript", "typescript"),
        ("TS", "typescript"),

        ("Postgres", "postgresql"),
        ("Postgres DB", "postgresql"),

        ("AWS Cloud", "aws"),

        ("RESTful API", "rest api"),
        ("RESTful APIs", "rest api"),
        ("REST API", "rest api"),

        ("", ""),
        ("   ", ""),
        (None, ""),
    ]

    for input_skill, expected in test_cases:

        result = normalize_skill(input_skill)

        print(
            f"{input_skill!r} -> {result!r}"
        )

        assert result == expected


def test_normalize_skills():

    skills = [
        "Python",
        "python",
        "PYTHON",
        "Fast API",
        "fastapi",
        "JavaScript",
        "JS",
        "",
        None,
    ]

    result = normalize_skills(skills)

    print("\nNormalized skills:")
    print(result)

    assert result == [
        "python",
        "fastapi",
        "javascript"
    ]


if __name__ == "__main__":

    test_normalize_skill()
    test_normalize_skills()

    print("\n✓ Skill normalization tests passed")