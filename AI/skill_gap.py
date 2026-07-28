import json
from pathlib import Path


def load_json(path):

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:
        return json.load(f)



def find_skill_gap(
        candidate_skills,
        job_skills
):

    # convert to lowercase for comparison

    candidate_skills = [
        skill.lower()
        for skill in candidate_skills
    ]

    job_skills = [
        skill.lower()
        for skill in job_skills
    ]


    missing = []

    for skill in job_skills:

        if skill not in candidate_skills:
            missing.append(skill)


    return missing



def main():

    base = Path(__file__).parent

    output = base / "output"


    # Load files

    resume = load_json(
        output / "resume.json"
    )

    job = load_json(
        output / "job.json"
    )


    candidate_skills = resume.get(
        "skills",
        []
    )


    job_skills = job.get(
        "required_skills",
        []
    )


    missing_skills = find_skill_gap(
        candidate_skills,
        job_skills
    )


    result = {

        "missing": missing_skills

    }


    print("\n===== SKILL GAP =====\n")

    print(
        json.dumps(
            result,
            indent=4
        )
    )


    # Save result

    with open(
        output / "skill_gap.json",
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            result,
            f,
            indent=4,
            ensure_ascii=False
        )


    print(
        "\n✅ Saved: output/skill_gap.json"
    )



if __name__ == "__main__":
    main()