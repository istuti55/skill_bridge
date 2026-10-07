# SkillBridge

AI-powered career matching and recruitment platform. Candidates upload a CV and get matched to jobs, skill-gap analysis and career recommendations. Companies post jobs and get ranked applicants. Admins approve companies and jobs and moderate reviews.

7th-semester B.E. project, Pathivara Centre for Advanced Studies, Purbanchal University.

## Features

**Candidate**
- Register / login (JWT), upload CV (PDF) and auto-parse it
- Browse and apply to approved jobs, track application stages
- Job match score with skill-gap analysis
- AI career-path recommendations and learning roadmap
- Dashboard with recommended jobs, progress and notifications

**Company**
- Company profile (approved by admin)
- Post, edit and close jobs
- View applicants, ranked candidates per job and side-by-side comparison
- Move applicants through hiring stages

**Admin**
- Approve companies and jobs
- Manage users, platform stats
- Reviews and flagged-content moderation

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind |
| Backend | Django, Django REST Framework, SimpleJWT |
| Database | PostgreSQL |
| AI | PyMuPDF (CV parsing), sentence-transformers (embeddings), scikit-learn / numpy, Ollama (local LLM) |

## Project structure

```
core/                            Django app (models, serializers, API views)
skillbridge_backend/             Django project settings
AI/
  parsing/                       Resume and job parsers
  matching/                      Skill, experience, education matching + embeddings
  intelligence/                  Skill-gap and career recommender
  llm/                           Ollama client and prompts
  evaluation/                    Evaluation scripts and datasets
  tests/                         AI unit tests
frontend/skillbridge-frontend/   React app
requirements.txt
.env.example
```

Django imports the `AI/` modules directly (`core/ai_bridge.py`); there is no separate AI server. All Ollama calls go through `AI/llm/ollama_client.py`.

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- [Ollama](https://ollama.com) with a model pulled (default `llama3.2`)

## Setup

### 1. Clone

```bash
git clone https://github.com/istuti55/skill_bridge.git
cd skill_bridge
```

### 2. Database

Create a PostgreSQL database named `skillbridge`.

### 3. Ollama

```bash
ollama pull llama3.2
ollama serve
```

Ollama must be running for CV parsing, skill-gap summaries and career recommendations.

### 4. Backend

```bash
python -m venv venv
venv\Scripts\activate            # Windows
# source venv/bin/activate       # macOS / Linux
pip install -r requirements.txt
copy .env.example .env           # then fill in your values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Runs at http://127.0.0.1:8000

### 5. Frontend

```bash
cd frontend/skillbridge-frontend
npm install
npm run dev
```

Runs at http://localhost:5173

Optional: create `frontend/skillbridge-frontend/.env` with `VITE_API_URL=http://127.0.0.1:8000/api` (already the default).

## Environment variables (`.env`)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for development |
| `ALLOWED_HOSTS` | Comma-separated hosts |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL connection |
| `OLLAMA_HOST` | Default `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Default `llama3.2:latest` |
| `CORS_ORIGINS` | Allowed frontend origins |

## API overview

Base URL: `/api/`

| Area | Endpoints |
|------|-----------|
| Auth | `register/`, `login/`, `token/refresh/` |
| Candidate | `candidates/upload-cv/`, `candidates/me/`, `candidates/career-paths/`, `skill-gaps/` |
| Company | `companies/me/`, `companies/`, `companies/<id>/approve/` |
| Jobs | `jobs/`, `jobs/<id>/`, `jobs/<id>/apply/`, `jobs/<id>/match/`, `jobs/<id>/close/`, `jobs/<id>/approve/` |
| Recruiter tools | `jobs/<id>/applications/`, `jobs/<id>/ranked-candidates/`, `jobs/<id>/compare/` |
| Applications | `applications/mine/`, `applications/<id>/` |
| Dashboards | `dashboard/candidate/`, `dashboard/company/` |
| Notifications | `notifications/`, `notifications/<id>/read/` |
| Reviews | `reviews/` |
| Admin | `admin/stats/`, `admin/users/`, `admin/flagged/` |

## Running tests

```bash
python manage.py test core
pytest AI/tests
python AI/evaluation/run_all_evaluations.py
```

## Team

- Stuti Bagale Thapa
- Naina Theguwa Limbu
- Bhawana Shah

Supervisor: Er. Tapan Sarkar
