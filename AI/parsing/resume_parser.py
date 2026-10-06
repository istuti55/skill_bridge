import fitz
import json
import re

from llm.ollama_client import call_ollama


def extract_text(pdf_path: str) -> str:
    """
    Extract all text from a PDF resume.
    """

    document = fitz.open(pdf_path)

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text


def extract_summary(resume_text: str) -> str:
    """
    Extract the professional summary directly from
    the resume text.
    """

    match = re.search(
        r"PROFESSIONAL SUMMARY\s*(.*?)\s*CORE COMPETENCIES",
        resume_text,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return ""

    summary = match.group(1)

    summary = re.sub(
        r"\s+",
        " ",
        summary
    ).strip()

    return summary


def extract_experience_dates(resume_text: str) -> list:
    """
    Extract employment date ranges from the resume.

    This is deterministic and does not depend on Ollama.

    Expected examples:

        June 2023 – Present
        August 2021 – May 2023

    Returns:

        [
            {
                "start_date": "June 2023",
                "end_date": "Present",
                "current": True
            },
            {
                "start_date": "August 2021",
                "end_date": "May 2023",
                "current": False
            }
        ]
    """

    date_pattern = (
        r"\b("
        r"(?:January|February|March|April|May|June|July|August|"
        r"September|October|November|December)"
        r"\s+\d{4}"
        r")"
        r"\s*[–—-]\s*"
        r"(Present|"
        r"(?:January|February|March|April|May|June|July|August|"
        r"September|October|November|December)"
        r"\s+\d{4})"
    )

    matches = re.findall(
        date_pattern,
        resume_text,
        re.IGNORECASE
    )

    dates = []

    for start_date, end_date in matches:

        start_date = start_date.strip()
        end_date = end_date.strip()

        current = end_date.lower() == "present"

        dates.append(
            {
                "start_date": start_date,
                "end_date": end_date,
                "current": current
            }
        )

    return dates


def apply_experience_dates(resume_data, experience_dates):
    """
    Apply deterministically extracted dates to the
    experience entries returned by Ollama.

    Dates are assigned in the same order as the
    experience entries.
    """

    experiences = resume_data.get(
        "experience",
        []
    )

    for index, experience in enumerate(experiences):

        if index >= len(experience_dates):
            break

        date_info = experience_dates[index]

        experience["start_date"] = date_info[
            "start_date"
        ]

        experience["end_date"] = date_info[
            "end_date"
        ]

        experience["current"] = date_info[
            "current"
        ]

    return resume_data


def parse_resume(pdf_path: str) -> str:
    """
    Parse a resume PDF using Ollama while using
    deterministic extraction for critical fields.
    """

    resume_text = extract_text(pdf_path)

    # ==========================================================
    # DETERMINISTIC EXTRACTION
    # ==========================================================

    extracted_summary = extract_summary(
        resume_text
    )

    extracted_experience_dates = (
        extract_experience_dates(
            resume_text
        )
    )

    # ==========================================================
    # OLLAMA PARSING
    # ==========================================================

    prompt = f"""
You are a professional resume parser for SkillBridge.

Extract the important information from this resume.

Return ONLY valid JSON.

Use EXACTLY this structure:

{{
    "personal": {{
        "name": "",
        "email": "",
        "phone": "",
        "location": ""
    }},
    "summary": "",
    "skills": [],
    "education": [],
    "experience": [
        {{
            "title": "",
            "company": "",
            "start_date": "",
            "end_date": "",
            "current": false,
            "details": ""
        }}
    ],
    "projects": [
        {{
            "title": "",
            "description": ""
        }}
    ],
    "certifications": []
}}

IMPORTANT RULES:

1. Do not invent information.

2. If information is missing, leave the field empty.

3. Keep technical skills as separate items.

4. For EVERY experience entry:
   - Extract the job title.
   - Extract the company name.
   - Extract the responsibilities and achievements.
   - Do not invent dates.

5. Preserve the wording of responsibilities and achievements.

6. Experience dates will be corrected separately by the
   deterministic resume parser.

7. If the resume says "Present":
   - Set "current" to true.

8. If no project exists:
   "projects": []

9. Extract EVERY clearly identified project.

10. For EVERY project:
    - Put the project name in "title".
    - Put technologies, purpose, features, implementation
      details, deployment details, and other relevant
      information in "description".
    - Do not put ordinary job responsibilities into projects.
    - Do not invent projects.

11. Do not invent or rewrite the professional summary.

12. The summary field must always be a string.

13. Return valid JSON only.

RESUME:
{resume_text}
"""

    response = call_ollama(prompt)

    try:

        resume_data = json.loads(
            response
        )

    except json.JSONDecodeError as e:

        raise ValueError(
            f"Resume parser returned invalid JSON: {e}"
        )

    # ==========================================================
    # APPLY DETERMINISTIC FIELDS
    # ==========================================================

    resume_data["summary"] = extracted_summary

    resume_data = apply_experience_dates(
        resume_data,
        extracted_experience_dates
    )

    return json.dumps(
        resume_data,
        ensure_ascii=False
    )