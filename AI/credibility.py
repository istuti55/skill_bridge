import json
import re
from pathlib import Path


def load_json(path):

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:
        return json.load(f)



# ----------------------------
# Timeline consistency
# ----------------------------

def check_timeline(experience):

    if len(experience) <= 1:
        return 100

    dates = []

    for exp in experience:

        years = exp.get(
            "years",
            ""
        )

        # Convert any value to string
        years = str(years)

        found = re.findall(
            r"\d{4}",
            years
        )

        for year in found:
            dates.append(int(year))


    if len(dates) <= 1:
        return 100


    # Check chronological order

    if dates == sorted(dates):

        return 100

    else:

        return 60

# ----------------------------
# Skill consistency
# ----------------------------

def check_skill_consistency(
        skills,
        experience
):

    text = json.dumps(
        experience
    ).lower()


    matched = 0


    for skill in skills:

        if skill.lower() in text:
            matched += 1


    if len(skills) == 0:
        return 50


    return (
        matched /
        len(skills)
    ) * 100



# ----------------------------
# Keyword stuffing
# ----------------------------

def check_keyword_stuffing(
        skills
):

    duplicates = len(skills) - len(
        set(
            skills
        )
    )


    if duplicates > 3:
        return 50


    return 100



# ----------------------------
# Main
# ----------------------------

def main():

    base = Path(__file__).parent

    output = base / "output"


    resume = load_json(
        output / "resume.json"
    )


    skills = resume.get(
        "skills",
        []
    )


    experience = resume.get(
        "experience",
        []
    )


    timeline_score = check_timeline(
        experience
    )


    skill_score = check_skill_consistency(
        skills,
        experience
    )


    keyword_score = check_keyword_stuffing(
        skills
    )


    credibility = (
        timeline_score * 0.4 +
        skill_score * 0.4 +
        keyword_score * 0.2
    )


    credibility = round(
        credibility,
        2
    )


    if credibility >= 80:

        risk = "Low"

    elif credibility >= 60:

        risk = "Medium"

    else:

        risk = "High"



    result = {

        "credibility": credibility,

        "risk": risk,

        "details": {

            "timeline_score": timeline_score,

            "skill_consistency_score": round(
                skill_score,
                2
            ),

            "keyword_score": keyword_score
        }
    }



    print(
        json.dumps(
            result,
            indent=4
        )
    )


    with open(
        output / "credibility.json",
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            result,
            f,
            indent=4
        )


    print(
        "\n✅ Saved credibility.json"
    )



if __name__ == "__main__":
    main()