def experience_match(candidate_experience, required_experience):
    """
    Compare candidate experience with required experience.

    candidate_experience: number of years
    required_experience: number of years

    Scoring:
        Candidate >= Required -> 100
        Candidate < Required  -> proportional score
        Missing/invalid data   -> 0
    """

    # ==========================================================
    # 1. HANDLE MISSING / INVALID REQUIRED EXPERIENCE
    # ==========================================================

    try:
        required_experience = float(required_experience)
    except (TypeError, ValueError):
        return 0.0

    # Negative requirements do not make sense.
    if required_experience < 0:
        required_experience = 0.0

    # If the job has no experience requirement,
    # the candidate automatically satisfies it.
    if required_experience == 0:
        return 100.0

    # ==========================================================
    # 2. HANDLE MISSING / INVALID CANDIDATE EXPERIENCE
    # ==========================================================

    try:
        candidate_experience = float(candidate_experience)
    except (TypeError, ValueError):
        return 0.0

    # Negative candidate experience is invalid.
    if candidate_experience < 0:
        candidate_experience = 0.0

    # ==========================================================
    # 3. CHECK WHETHER REQUIREMENT IS SATISFIED
    # ==========================================================

    if candidate_experience >= required_experience:
        return 100.0

    # ==========================================================
    # 4. PROPORTIONAL SCORE
    # ==========================================================

    score = (
        candidate_experience
        / required_experience
    ) * 100

    # Never allow the score to exceed 100.
    score = min(score, 100.0)

    return round(score, 2)