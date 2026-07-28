import json
from pathlib import Path
from ollama import chat
from job_prompts import JOB_PROMPT


def main():

    job_text = input("Paste job description:\n")

    prompt = JOB_PROMPT.format(job=job_text)

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

    job_data = json.loads(result)

    print("\n===== JOB JSON =====")
    print(json.dumps(job_data, indent=4))


    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)

    with open(
        output_dir / "job.json",
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            job_data,
            f,
            indent=4,
            ensure_ascii=False
        )

    print("\n✅ job.json created")


if __name__ == "__main__":
    main()