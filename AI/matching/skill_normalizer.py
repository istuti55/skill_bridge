
import re


def normalize_skill(skill: str) -> str:
    """
    Normalize a single skill name so that
    different representations can be compared.
    """

    if not skill:
        return ""

    skill = skill.strip().lower()

    # Remove content inside parentheses.
    # Example:
    # "AWS (S3, EC2, Lambda)" -> "aws"
    skill = re.sub(r"\([^)]*\)", "", skill)

    # Normalize common separators.
    skill = skill.replace("-", " ")
    skill = skill.replace("_", " ")

    # Remove extra whitespace.
    skill = re.sub(r"\s+", " ", skill).strip()

    # Common aliases.
    aliases = {
        "fast api": "fastapi",
        "fast-api": "fastapi",
        "restful api": "rest api",
        "restful apis": "rest api",
        "rest api": "rest api",
        "js": "javascript",
        "javascript es6+": "javascript",
        "javascript es6": "javascript",
        "ts": "typescript",
        "postgres": "postgresql",
        "postgres db": "postgresql",
        "aws cloud": "aws",
    }

    return aliases.get(skill, skill)


def normalize_skills(skills: list) -> list:
    """
    Normalize a list of skills and remove duplicates.
    """

    normalized = []

    for skill in skills:
        normalized_skill = normalize_skill(skill)

        if normalized_skill and normalized_skill not in normalized:
            normalized.append(normalized_skill)

    return normalized