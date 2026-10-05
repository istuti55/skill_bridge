from fastapi import FastAPI, UploadFile, File, Form


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
    return {
        "message": "Analysis endpoint created",
        "resume_filename": resume.filename,
        "job_description_received": bool(job_description.strip())
    }