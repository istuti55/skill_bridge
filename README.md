# SkillBridge

A job platform with three roles: **candidate**, **company**, **admin**.
Candidates upload a CV and apply to jobs. Companies post jobs and manage applicants. Admins approve companies and jobs.

## Tech stack
- Frontend: React + Vite
- Backend: Django + Django REST Framework (JWT login)
- Database: PostgreSQL
- AI: CV parsing and matching (code in `AI/`, used directly by Django), Ollama for text generation

## Project structure
```
core/                            Django app (models, API views)
skillbridge_backend/             Django settings
AI/                              AI modules (matching, parsing, intelligence, llm)
frontend/skillbridge-frontend/   React app
requirements.txt
.env.example
```

## How the AI is connected
Django imports the `AI/` modules directly (`core/ai_bridge.py`). There is no separate AI server.
All Ollama calls go through one file: `AI/llm/ollama_client.py`. Ollama must be running for CV parsing, skill-gap summaries and career recommendations.

## Setup

### 1. Backend
```
python -m venv venv
venv\Scripts\activate            # Windows
pip install -r requirements.txt
copy .env.example .env           # then fill in your values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Runs at http://127.0.0.1:8000

### 2. Frontend
```
cd frontend/skillbridge-frontend
npm install
npm run dev
```
Runs at http://localhost:5173

Optional: create `frontend/skillbridge-frontend/.env` with
`VITE_API_URL=http://127.0.0.1:8000/api` (this is already the default).

### 3. Ollama (for AI features)
Install from https://ollama.com, then run `ollama pull llama3.2:latest`.

## Environment variables (`.env`)

| Name | Meaning |
|---|---|
| `SECRET_KEY` | Django secret key (long random text) |
| `DEBUG` | `True` locally, `False` in production |
| `ALLOWED_HOSTS` | Allowed host names, comma separated |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL connection |
| `DB_SSLMODE` | `prefer` locally, `require` for cloud databases such as Neon |
| `CORS_ORIGINS` | Frontend URLs allowed to call the API, comma separated |
| `OLLAMA_HOST` | Ollama address (default `http://127.0.0.1:11434`) |
| `OLLAMA_MODEL` | Ollama model (default `llama3.2:latest`) |
| `OLLAMA_TIMEOUT` | Seconds to wait for Ollama (default `300`) |

Frontend: `VITE_API_URL` is the backend API address, including `/api`.

Never commit `.env`. Share real values privately.

## API
Base URL: `http://127.0.0.1:8000/api`. Send `Authorization: Bearer <access token>` on all endpoints except register and login.

### Auth
| Method | Path | What |
|---|---|---|
| POST | `/register/` | Create an account |
| POST | `/login/` | Get access and refresh tokens |
| POST | `/token/refresh/` | Get a new access token |

### Candidate
| Method | Path | What |
|---|---|---|
| POST | `/candidates/upload-cv/` | Upload a CV (PDF, max 5 MB) |
| GET, PATCH | `/candidates/me/` | View or edit own profile |
| GET | `/candidates/career-paths/` | AI career recommendations |
| GET | `/skill-gaps/` | Skill gap for a job, with AI summary |
| GET | `/jobs/<id>/match/` | Match score for a job |
| POST | `/jobs/<id>/apply/` | Apply to a job |
| GET | `/applications/mine/` | Own applications |
| GET | `/dashboard/candidate/` | Dashboard data |