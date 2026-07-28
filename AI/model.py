import json
from pathlib import Path
from ollama import chat

from parser import extract_text
from prompts import RESUME_PROMPT


def main():
    # Ask user for PDF path
    pdf_path = input("Enter PDF path: ").strip()

    # Extract text from PDF
    resume_text = extract_text(pdf_path)

    # Create prompt
    prompt = RESUME_PROMPT.format(resume=resume_text)

    # Send to Ollama
    response = chat(
    model="qwen3",
    format="json",
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ]
)

    result = response["message"]["content"]

    print("\n===== AI OUTPUT =====\n")
    print(result)

    # Find JSON in response
    start = result.find("{")
    end = result.rfind("}")

    if start == -1 or end == -1:
        print("\n❌ No JSON found in the model response.")
        return

    json_text = result[start:end + 1]

    try:
        data = json.loads(json_text)

        print("\n===== PARSED JSON =====\n")
        print(json.dumps(data, indent=4, ensure_ascii=False))

        # Save relative to model.py
        base_dir = Path(__file__).parent
        output_dir = base_dir / "output"
        output_dir.mkdir(exist_ok=True)

        output_file = output_dir / "resume.json"

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        print(f"\n✅ JSON saved successfully!")
        print(f"📁 Location: {output_file.resolve()}")

    except json.JSONDecodeError as e:
        print("\n❌ Invalid JSON returned by Ollama.")
        print(e)


if __name__ == "__main__":
    main()