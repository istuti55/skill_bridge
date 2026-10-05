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
# Response Standardization
# --------------------------------------------------

def normalize_analysis_result(result):
    """
    Ensure the AI analysis response always follows
    the standard SkillBridge API structure.
    """

    result = result if isinstance(result, dict) else {}

    candidate = result.get("candidate")
    if not isinstance(candidate, dict):
        candidate = {}

    job = result.get("job")
    if not isinstance(job, dict):
        job = {}

    credibility = result.get("credibility")
    if not isinstance(credibility, dict):
        credibility = {}

    matching = result.get("matching")
    if not isinstance(matching, dict):
        matching = {}

    skill_gap = result.get("skill_gap")
    if not isinstance(skill_gap, dict):
        skill_gap = {}

    career_recommendation = result.get("career_recommendation")
    if not isinstance(career_recommendation, dict):
        career_recommendation = {}

    # Matching defaults
    matching.setdefault("overall_score", 0.0)
    matching.setdefault("skills_score", 0.0)
    matching.setdefault("experience_score", 0.0)
    matching.setdefault("education_score", 0.0)
    matching.setdefault("matched_skills", [])
    matching.setdefault("missing_skills", [])
    matching.setdefault("recommendation", "")

    if not isinstance(matching["matched_skills"], list):
        matching["matched_skills"] = []

    if not isinstance(matching["missing_skills"], list):
        matching["missing_skills"] = []

    # Required skill gap
    required = skill_gap.get("required")

    if not isinstance(required, dict):
        required = {}

    required.setdefault("matched_skills", [])
    required.setdefault("missing_skills", [])
    required.setdefault("skill_gap_percentage", 0.0)

    # Preferred skill gap
    preferred = skill_gap.get("preferred")

    if not isinstance(preferred, dict):
        preferred = {}

    preferred.setdefault("matched_skills", [])
    preferred.setdefault("missing_skills", [])
    preferred.setdefault("skill_gap_percentage", 0.0)

    skill_gap["required"] = required
    skill_gap["preferred"] = preferred

    skill_gap.setdefault("learning_priorities", [])

    if not isinstance(skill_gap["learning_priorities"], list):
        skill_gap["learning_priorities"] = []

    # Career recommendation defaults
    career_recommendation.setdefault("recommended_roles", [])
    career_recommendation.setdefault("skill_priorities", [])
    career_recommendation.setdefault("learning_path", [])
    career_recommendation.setdefault("reason", "")

    if not isinstance(
        career_recommendation["recommended_roles"],
        list
    ):
        career_recommendation["recommended_roles"] = []

    if not isinstance(
        career_recommendation["skill_priorities"],
        list
    ):
        career_recommendation["skill_priorities"] = []

    if not isinstance(
        career_recommendation["learning_path"],
        list
    ):
        career_recommendation["learning_path"] = []

    return {
        "candidate": candidate,
        "job": job,
        "credibility": credibility,
        "matching": matching,
        "skill_gap": skill_gap,
        "career_recommendation": career_recommendation
    }


def error_response(code, message):
    """
    Return a standardized API error response.
    """

    return {
        "success": False,
        "error": {
            "code": code,
            "message": message
        }
    }


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

    # --------------------------------------------------
    # Validate Job Description
    # --------------------------------------------------

    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail=error_response(
                "EMPTY_JOB_DESCRIPTION",
                "Job description cannot be empty."
            )
        )

    # --------------------------------------------------
    # Validate Job Description Length
    # --------------------------------------------------

    if len(job_description) > MAX_JOB_DESCRIPTION_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=error_response(
                "JOB_DESCRIPTION_TOO_LONG",
                "Job description is too long. Maximum length is 10,000 characters."
            )
        )

    # --------------------------------------------------
    # Check Filename
    # --------------------------------------------------

    if not resume.filename:
        raise HTTPException(
            status_code=400,
            detail=error_response(
                "MISSING_FILENAME",
                "Resume filename is missing."
            )
        )

    # --------------------------------------------------
    # Check File Extension
    # --------------------------------------------------

    extension = os.path.splitext(
        resume.filename
    )[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=error_response(
                "UNSUPPORTED_FILE_TYPE",
                "Unsupported file type. Only PDF and DOCX files are allowed."
            )
        )

    # --------------------------------------------------
    # Read Uploaded File
    # --------------------------------------------------

    resume_data = await resume.read()

    # --------------------------------------------------
    # Check Empty File
    # --------------------------------------------------

    if not resume_data:
        raise HTTPException(
            status_code=400,
            detail=error_response(
                "EMPTY_RESUME",
                "Uploaded resume is empty."
            )
        )

    # --------------------------------------------------
    # Check File Size
    # --------------------------------------------------

    if len(resume_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=error_response(
                "FILE_TOO_LARGE",
                "Resume file is too large. Maximum size is 5 MB."
            )
        )

    # --------------------------------------------------
    # Validate Actual File Content
    # --------------------------------------------------

    if not is_valid_file_content(
        extension,
        resume_data
    ):
        raise HTTPException(
            status_code=400,
            detail=error_response(
                "INVALID_FILE_CONTENT",
                "File content does not match the selected file type."
            )
        )

    # --------------------------------------------------
    # Create Temporary File
    # --------------------------------------------------

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=extension
    ) as temp_file:

        temp_file.write(resume_data)

        temp_resume_path = temp_file.name

    # --------------------------------------------------
    # Run AI Analysis
    # --------------------------------------------------

    try:

        result = analyze_candidate(
            temp_resume_path,
            job_description
        )

        return normalize_analysis_result(result)

    # --------------------------------------------------
    # Internal Error Handling
    # --------------------------------------------------

    except Exception as e:

        # Log actual error on the server
        print(f"Analysis error: {e}")

        # Return standardized error to client
        raise HTTPException(
            status_code=500,
            detail=error_response(
                "ANALYSIS_ERROR",
                "An error occurred while analyzing the candidate."
            )
        )

    # --------------------------------------------------
    # Cleanup Temporary File
    # --------------------------------------------------

    finally:

        if os.path.exists(temp_resume_path):
            os.remove(temp_resume_path)