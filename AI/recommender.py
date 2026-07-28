import json
from pathlib import Path
from ollama import chat


def load_json(path):

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:
        return json.load(f)



def main():

    base = Path(__file__).parent

    output = base / "output"


    # Load resume and skill gap

    resume = load_json(
        output / "resume.json"
    )

    skill_gap = load_json(
        output / "skill_gap.json"
    )


    skills = resume.get(
        "skills",
        []
    )

    missing = skill_gap.get(
        "missing",
        []
    )


    prompt = f"""
You are an expert career advisor.

Based on the candidate skills and missing skills,
recommend the most suitable career path.

Candidate skills:

{skills}


Missing skills:

{missing}


Return ONLY valid JSON.

Format:

{{
    "career": "",
    "reason": "",
    "roadmap": [
        "",
        ""
    ]
}}

Rules:
- Only JSON.
- No markdown.
- Give practical learning steps.
"""


    response = chat(
        model="llama3.2",
        format="json",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )


    result = response["message"]["content"]


    recommendation = json.loads(
        result
    )


    print("\n===== CAREER RECOMMENDATION =====\n")

    print(
        json.dumps(
            recommendation,
            indent=4
        )
    )


    # Save output

    with open(
        output / "career_recommendation.json",
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            recommendation,
            f,
            indent=4,
            ensure_ascii=False
        )


    print(
        "\n✅ Saved: output/career_recommendation.json"
    )



if __name__ == "__main__":
    main()