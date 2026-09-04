def education_match(candidate_education, required_education):
    """
    Compare candidate education with job requirements.
    Handles education returned as dictionaries or strings.
    """

    if not required_education:
        return 100.0

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