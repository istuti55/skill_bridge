def education_match(candidate_education, required_education):
    """
    Compare candidate education with job requirements.
    Handles education returned as dictionaries or strings.
    """

    if not required_education:
        return 100.0
import re


def _education_to_text(education):
    """
    Convert education entries into a single normalized text string.

    Education may be represented as:
        - dictionaries
        - strings
    """

    if not education:
        return ""

    parts = []

    for item in education:

        if isinstance(item, dict):
            parts.append(
                " ".join(
                    str(value)
                    for value in item.values()
                    if value is not None
                )
            )

        else:
            parts.append(str(item))

    return " ".join(parts).lower().strip()


def _extract_degree_level(text):
    """
    Extract the highest/most relevant degree level
    from education text.
    """

    if not text:
        return None

    # Check more specific/higher levels first.
    if re.search(r"\b(phd|ph\.d|doctorate|doctoral)\b", text):
        return "phd"

    if re.search(
        r"\b(master|masters|m\.s\.|m\.sc|m\.e\.|m\.tech|mba|msc)\b",
        text
    ):
        return "master"

    if re.search(
        r"\b(bachelor|bachelors|b\.s\.|b\.sc|b\.e\.|b\.tech|be|bs|bsc)\b",
        text
    ):
        return "bachelor"

    return None


def _extract_field(text):
    """
    Extract the major/field from education text.

    This uses common IT/engineering education fields.
    """

    if not text:
        return None

    field_aliases = {
        "computer engineering": [
            "computer engineering"
        ],
        "computer science": [
            "computer science",
            "cs"
        ],
        "information technology": [
            "information technology",
            "information tech"
        ],
        "software engineering": [
            "software engineering"
        ],
        "electrical engineering": [
            "electrical engineering"
        ],
        "electronics engineering": [
            "electronics engineering",
            "electronics and communication engineering",
            "electronics communication engineering"
        ],
        "data science": [
            "data science"
        ],
        "artificial intelligence": [
            "artificial intelligence",
            "ai"
        ],
        "cybersecurity": [
            "cybersecurity",
            "cyber security"
        ],
        "information systems": [
            "information systems"
        ],
        "business administration": [
            "business administration",
            "business management"
        ],
    }

    for normalized_field, aliases in field_aliases.items():

        for alias in aliases:

            if re.search(
                rf"\b{re.escape(alias)}\b",
                text
            ):
                return normalized_field

    return None


def _education_score(candidate_text, required_text):
    """
    Calculate education compatibility.

    Degree level = 40%
    Field         = 60%
    """

    candidate_degree = _extract_degree_level(
        candidate_text
    )

    required_degree = _extract_degree_level(
        required_text
    )

    candidate_field = _extract_field(
        candidate_text
    )

    required_field = _extract_field(
        required_text
    )

    # ==========================================================
    # DEGREE SCORE
    # ==========================================================

    if candidate_degree and required_degree:

        if candidate_degree == required_degree:
            degree_score = 100.0

        else:
            degree_order = {
                "bachelor": 1,
                "master": 2,
                "phd": 3
            }

            candidate_level = degree_order.get(
                candidate_degree,
                0
            )

            required_level = degree_order.get(
                required_degree,
                0
            )

            # Higher degree can satisfy a lower-level
            # requirement, but not vice versa.
            if candidate_level > required_level:
                degree_score = 70.0

            else:
                degree_score = 0.0

    elif required_degree:
        degree_score = 0.0

    else:
        degree_score = 100.0

    # ==========================================================
    # FIELD SCORE
    # ==========================================================

    if candidate_field and required_field:

        if candidate_field == required_field:
            field_score = 100.0

        else:
            # Related technical fields receive partial credit.
            related_fields = {
                frozenset({
                    "computer science",
                    "computer engineering"
                }),
                frozenset({
                    "computer science",
                    "software engineering"
                }),
                frozenset({
                    "computer science",
                    "information technology"
                }),
                frozenset({
                    "computer engineering",
                    "information technology"
                }),
                frozenset({
                    "computer science",
                    "artificial intelligence"
                }),
                frozenset({
                    "computer science",
                    "data science"
                }),
            }

            pair = frozenset({
                candidate_field,
                required_field
            })

            if pair in related_fields:
                field_score = 70.0

            else:
                field_score = 0.0

    elif required_field:
        field_score = 0.0

    else:
        field_score = 100.0

    # ==========================================================
    # FINAL EDUCATION SCORE
    # ==========================================================

    score = (
        degree_score * 0.40
        + field_score * 0.60
    )

    return round(score, 2)


def education_match(candidate_education, required_education):
    """
    Compare candidate education with job requirements.

    Scoring:
        Degree level = 40%
        Field        = 60%

    Rules:
        No requirement -> 100
        Missing candidate education -> 0
        Higher degree can satisfy a lower requirement.
    """

    # ==========================================================
    # 1. NO EDUCATION REQUIREMENT
    # ==========================================================

    if not required_education:
        return 100.0

    # ==========================================================
    # 2. CONVERT EDUCATION TO TEXT
    # ==========================================================

    candidate_text = _education_to_text(
        candidate_education
    )

    required_text = _education_to_text(
        required_education
    )

    # ==========================================================
    # 3. MISSING CANDIDATE EDUCATION
    # ==========================================================

    if not candidate_text:
        return 0.0

    # ==========================================================
    # 4. CALCULATE EDUCATION SCORE
    # ==========================================================

    return _education_score(
        candidate_text,
        required_text
    )
    # Convert candidate education to text
    candidate_parts = []

    for item in candidate_education:
        if isinstance(item, dict):
            candidate_parts.append(
                " ".join(str(value) for value in item.values())
            )
        else:
            candidate_parts.append(str(item))

    # Convert required education to text
    required_parts = []

    for item in required_education:
        if isinstance(item, dict):
            required_parts.append(
                " ".join(str(value) for value in item.values())
            )
        else:
            required_parts.append(str(item))

    candidate_text = " ".join(candidate_parts).lower()
    required_text = " ".join(required_parts).lower()

    if not candidate_text:
        return 0.0

    required_words = set(required_text.split())
    candidate_words = set(candidate_text.split())

    matched = required_words.intersection(candidate_words)

    score = len(matched) / len(required_words) * 100

    return round(score, 2)