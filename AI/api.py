from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from ai_engine import analyze_candidate

import os
import tempfile


app = FastAPI(
    title="SkillBridge AI API",
    description="Backend API for SkillBridge AI services",
    version="1.0.0"
)


MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@app.get("/")
def root():
    return {
        "message": "SkillBridge AI API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Validate job description
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )

    # Check filename
    if not resume.filename:
        raise HTTPException(
            status_code=400,
            detail="Resume filename is missing."
        )

    # Check file extension
    extension = os.path.splitext(resume.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only PDF and DOCX files are allowed."
        )

    # Read uploaded file
    resume_data = await resume.read()

    # Check empty file
    if not resume_data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded resume is empty."
        )

    # Check file size
    if len(resume_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Resume file is too large. Maximum size is 5 MB."
        )

    # Create temporary file
    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=extension
    ) as temp_file:

        temp_file.write(resume_data)
        temp_resume_path = temp_file.name

    try:
        # Run existing AI engine
        result = analyze_candidate(
            temp_resume_path,
            job_description
        )

        return result

    except Exception as e:
        # Log actual error on the server
        print(f"Analysis error: {e}")

        # Return clean error to API client
        raise HTTPException(
            status_code=500,
            detail="An error occurred while analyzing the candidate."
        )

    finally:
        # Always delete temporary file
        if os.path.exists(temp_resume_path):
            os.remove(temp_resume_path)