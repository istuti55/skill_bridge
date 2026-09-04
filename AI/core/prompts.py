RESUME_PROMPT = """
You are an expert resume parser.

Extract the resume information.

Return ONLY valid JSON matching this schema:

{{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "education": [
    {{
      "degree": "",
      "school": "",
      "gpa": ""
    }}
  ],
  "experience": [
    {{
      "company": "",
      "position": "",
      "years": "",
      "description": ""
    }}
  ],
  "projects": [],
  "experience_years": 0
}}

Rules:
- Return ONLY JSON.
- Do not use markdown.
- Do not explain anything.
- experience_years must be a single integer.
- If a value is missing, use null or [].
- The JSON must be valid.

Resume:

{resume}
"""