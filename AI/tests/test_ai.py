from ai_engine import analyze_resume


result = analyze_resume(
    "sample_resumes/Resume.pdf",
    """
    Looking for Python Backend Developer.
    Required:
    Python, FastAPI, Docker, AWS
    """
)


print(result)