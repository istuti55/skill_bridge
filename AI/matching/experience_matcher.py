def experience_match(candidate_experience, required_experience):
    """
    Compare candidate experience with required experience.

    candidate_experience: number of years
    required_experience: number of years
    """

    if required_experience <= 0:
        return 100.0

    if candidate_experience >= required_experience:
        return 100.0

    score = (candidate_experience / required_experience) * 100

    return round(score, 2)