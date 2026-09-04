import json

from parsing.resume_parser import parse_resume


pdf_path = "sample_resumes/Resume.pdf"

print("Reading resume...")

result = parse_resume(pdf_path)

print("\n===== AI RESUME OUTPUT =====\n")

print(result)