from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from ai_engine import analyze_candidate

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import os
import tempfile


app = FastAPI(
    title="SkillBridge AI API",
    description="Backend API for SkillBridge AI services",
    version="1.0.0"
)


# --------------------------------------------------
# Rate Limiting
# --------------------------------------------------

limiter = Limiter(key_func=get_remote_address)

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)


# --------------------------------------------------
# CORS Security
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Security Headers
# --------------------------------------------------

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"

    return response


# --------------------------------------------------
# Request Limits
# --------------------------------------------------

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

MAX_JOB_DESCRIPTION_LENGTH = 10_000


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx"
}


# --------------------------------------------------
# File Validation
# --------------------------------------------------

def is_valid_file_content(extension, file_data):
    """
    Validate the actual file signature.

    PDF files should start with %PDF.
    DOCX files are ZIP-based Office documents and start with PK.
    """

    if extension == ".pdf":
        return file_data.startswith(b"%PDF")

    if extension == ".docx":
        return file_data.startswith(b"PK")

    return False


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "SkillBridge AI API is running"
    }


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# Resume Analysis
# --------------------------------------------------

@app.post("/analyze")
@limiter.limit("10/minute")
async def analyze(
    request: Request,
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Validate job description
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )

    # Validate job description length
    if len(job_description) > MAX_JOB_DESCRIPTION_LENGTH:
        raise HTTPException(
            status_code=400,
            detail="Job description is too long. Maximum length is 10,000 characters."
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

    # Validate actual file content
    if not is_valid_file_content(extension, resume_data):
        raise HTTPException(
            status_code=400,
            detail="File content does not match the selected file type."
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