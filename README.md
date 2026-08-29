# VisaMatch AI

VisaMatch AI is an open-source full-stack application for international tech talent who need better visibility into job fit, sponsorship signals, and time-sensitive application planning.

## Architecture

```text
React + Vite + TypeScript + Tailwind
        |
        | Axios / JWT
        v
Express + TypeScript API
        |
        +--> Auth: bcryptjs + JWT
        +--> Job discovery/filtering
        +--> Application tracking
        +--> AI analysis: OpenAI Responses API / JSON Schema
        |
        v
Prisma ORM
        |
        v
PostgreSQL
```

## Repository layout

```text
visamatch-ai/
├── backend/
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts
│   ├── src/config/env.ts
│   ├── src/controllers/
│   ├── src/middleware/
│   ├── src/routes/
│   ├── src/utils/
│   ├── src/app.ts
│   ├── src/server.ts
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/components/
│   ├── src/pages/
│   ├── src/lib/
│   ├── src/types/
│   ├── src/App.tsx
│   ├── src/main.tsx
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Local development

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
```

Set a real `JWT_SECRET` of at least 32 characters and your `OPENAI_API_KEY`. Keep `.env` out of Git.

### 3. Install, migrate and seed

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

Start the API:

```bash
npm run dev
```

API: `http://localhost:4000`

Health check: `GET /health`

Demo candidate:

```text
Email: demo@visamatch.ai
Password: DemoPassword123!
```

Change/remove this demo account before deploying publicly.

### 4. Configure frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Main API routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create candidate/employer account |
| POST | `/api/auth/login` | No | Authenticate and issue JWT |
| GET | `/api/auth/me` | JWT | Get current account |
| GET | `/api/jobs` | No | Dynamic sponsorship/industry/skill filtering |
| GET | `/api/jobs/:id` | No | Get a job |
| POST | `/api/applications` | Candidate | Apply to a job |
| GET | `/api/applications` | Candidate | List candidate applications |
| GET | `/api/applications/:id` | Candidate | Application detail |
| POST | `/api/ai/analyze` | Candidate | Contextual AI match and feedback |

Example job filtering:

```text
GET /api/jobs?sponsorOnly=true&track=H-1B&skills=React,TypeScript
```

## AI design

The AI endpoint uses a strict JSON Schema response containing:

- 0–100 match score
- summary
- matched skills
- missing skills
- strengths
- gaps
- action plan
- sponsorship notes

The backend persists the complete structured result in `Application.aiFeedback` and the numeric score in `Application.aiScore`.

## Production hardening checklist

1. Put the API behind TLS and a reverse proxy/load balancer.
2. Replace localStorage JWT storage with an HttpOnly, Secure, SameSite cookie architecture if the threat model requires stronger XSS resistance.
3. Use a managed PostgreSQL service with automated backups, PITR, encryption and restricted network access.
4. Add Redis-backed distributed rate limiting if multiple API replicas are deployed.
5. Add structured logging, tracing, metrics and alerting.
6. Store uploaded resumes in private object storage with signed URLs; never make resume objects public.
7. Add malware scanning and content-type/size validation for resume uploads.
8. Add audit events for authentication, applications and AI analyses.
9. Encrypt sensitive resume data at rest and define retention/deletion controls.
10. Add employer verification workflows instead of treating a boolean seed value as legal proof of sponsorship.
11. Do not present AI scores as hiring decisions or immigration/legal advice.
12. Add human review and abuse monitoring before exposing the AI endpoint to untrusted public traffic.
13. Add automated tests for authorization boundaries, Prisma constraints, filters and AI response validation.
14. Rotate secrets and use a secret manager in production.
15. Pin dependency versions via committed lockfiles and run dependency/security scanning in CI.
