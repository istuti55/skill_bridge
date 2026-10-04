import fitz

from core.ollama_client import call_ollama


def extract_text(pdf_path: str) -> str:
    document = fitz.open(pdf_path)

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text


def parse_resume(pdf_path: str) -> str:
    resume_text = extract_text(pdf_path)

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
    "projects": [],
    "certifications": []
}}

IMPORTANT RULES:

1. Do not invent information.

2. If information is missing, leave the field empty.

3. Keep technical skills as separate items.

4. For EVERY experience entry:
   - Extract the job title.
   - Extract the company name.
   - Extract the start date.
   - Extract the end date.
   - If the person is still working there, set "current" to true.
   - Put the responsibilities and achievements in "details".

5. Preserve the dates exactly as they appear in the resume when possible.

6. If the resume says "Present", use:
   "end_date": "Present"
   and:
   "current": true

7. If no dates are available, leave the date fields empty.
   Do NOT guess dates.

8. Return valid JSON only.

RESUME:
{resume_text}
"""

    response = call_ollama(prompt)

    return response