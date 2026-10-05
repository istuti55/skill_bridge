from fastapi import FastAPI, UploadFile, File, Form
from ai_engine import analyze_candidate

import os
import tempfile


app = FastAPI(
    title="SkillBridge AI API",
    description="Backend API for SkillBridge AI services",
    version="1.0.0"
)


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
    suffix = os.path.splitext(resume.filename)[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        resume_data = await resume.read()
        temp_file.write(resume_data)
        temp_resume_path = temp_file.name

    try:
        result = analyze_candidate(
            temp_resume_path,
            job_description
        )

        return result

    finally:
        if os.path.exists(temp_resume_path):
            os.remove(temp_resume_path)