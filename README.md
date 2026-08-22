# HRM-Gene

A full-stack **Human Resource Management (HRM)** system built as a monorepo with a **NestJS** backend and a **Next.js** frontend. It covers the core HR lifecycle — employees, time & attendance, leave, payroll, performance (KPI/OKR), discipline, resignations, announcements, notifications, and analytics — with role-based access control and full English/Vietnamese localization.

> 🔗 Repo: https://github.com/Luo-Zhii/HRM-Gene.git

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Repository Structure](#repository-structure)
5. [Prerequisites](#prerequisites)
6. [Quick Start (Docker)](#quick-start-docker)
7. [Manual Setup](#manual-setup)
8. [Environment Variables](#environment-variables)
9. [Database Seeding](#database-seeding)
10. [Default Accounts](#default-accounts)
11. [Testing](#testing)
12. [CI/CD Pipelines](#cicd-pipelines)
13. [Documentation](#documentation)
14. [Access Points](#access-points)

---

## Overview

HRM-Gene is a monorepo containing:

| Package | Description | Port |
| --- | --- | --- |
| `backend/` | NestJS 9 REST + WebSocket API, TypeORM + PostgreSQL, Redis cache, JWT auth + RBAC | `3001` |
| `frontend/` | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts, i18n | `3000` |
| `black-box-e2e/` | Playwright end-to-end test suite (292 cases, IEEE-829) | — |
| `performace_testing_script/` | k6 load/stress/soak performance tests | — |
| `docs_diagram/` | UML, ERD, use-case, sequence & activity diagrams | — |

The backend exposes its API under the `/api` global prefix (e.g. `http://localhost:3001/api/...`). The frontend talks to it via the `NEXT_PUBLIC_API_URL` environment variable (with a `/api` rewrite when running under Docker).

---

## Tech Stack

**Backend**

- [NestJS](https://docs.nestjs.com) 9 — modular architecture, guards, interceptors
- [TypeORM](https://typeorm.io) 0.3 — entity mapping with `synchronize: true`
- PostgreSQL 12+ — primary data store
- Redis (via `cache-manager` + `ioredis`) — caching
- `@nestjs/jwt` + `passport-jwt` — stateless JWT authentication
- `@nestjs/websockets` + `socket.io` — real-time notifications & messages
- `@nestjs/schedule` — cron jobs (daily attendance sync, payroll)
- `bcrypt` — password hashing

**Frontend**

- [Next.js](https://nextjs.org/docs) 14 (App Router) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/docs) + `shadcn/ui`-style Radix primitives
- [Recharts](https://recharts.org) — payroll/analytics charts
- `i18next` / `react-i18next` — English & Vietnamese localization
- `html5-qrcode` — QR check-in scanning
- `socket.io-client` — real-time notifications

**DevOps & Tooling**

- Docker / docker-compose (backend + frontend services)
- GitLab CI (`.gitlab-ci.yml`) — SAST/SCA, unit, gray-box, E2E, DAST, performance
- GitHub Actions (`.github/workflows/node.js.yml`) — build pipeline
- Jest (unit + coverage), Playwright (E2E), k6 (performance), Semgrep/Snyk/Trivy/ZAP (security)

---

## Features

### Core HR & People

- **Employee management** — personal info, employment status, contracts, bank info, documents
- **Organizational structure** — departments & positions hierarchy
- **Contracts** — probation/official/part-time lifecycle, expiry tracking, salary history
- **Staff directory** — browsable employee listing

### Time & Attendance

- Check-in/check-out by **IP whitelist** or **QR code**
- Attendance calendar & status tracking (Present / Late / Half-day / Absent)
- Daily attendance sync via scheduled cron
- Public holidays management

### Leave Management

- Leave types, balances & accrual
- Self-service leave requests with multi-level approval (Manager → HR)
- Leave calendar & utilization reports

### Payroll & Benefits

- Salary config (base + allowances + deductions), salary history
- Monthly payroll generation with payslips, KPI bonus, PIT & insurance
- Payroll periods, adjustments & run automation

### Performance (KPI/OKR)

- KPI library, periods, and per-employee assignments
- Measurement units (Percentage, Number, currencies) & progress tracking

### Discipline & Resignations

- Violation tracking with severity levels & financial deductions
- Resignation workflow (notice → approval → termination) with final settlement

### Communications & Analytics

- Company announcements with audience targeting & priority
- Real-time in-app notifications (WebSocket) & contextual comments
- Messages, dashboard analytics & HR reports

### Security & Governance

- JWT authentication with RBAC (Position ↔ Permission matrix)
- Route/component protection on both backend (guards) and frontend (middleware)
- Audit logging, company settings & financial baselines
- **i18n** — full English / Vietnamese support

For the complete, detailed specification, see [`HRM_FUNCTIONAL_REQUIREMENTS.md`](HRM_FUNCTIONAL_REQUIREMENTS.md).

---

## Repository Structure

```
HRM-Gene/
├── backend/                     # NestJS API
│   ├── src/
│   │   ├── main.ts              # Bootstrap (CORS, /api prefix, static /uploads)
│   │   ├── app.module.ts        # Root module (TypeORM, Redis cache, scheduling)
│   │   ├── entities/            # 30 TypeORM entities
│   │   ├── modules/             # Feature modules (21 controllers)
│   │   ├── migrations/          # DB migrations
│   │   └── common/              # Shared guards & decorators
│   ├── scripts/seed.ts          # DB seeder (dropSchema + sample data)
│   ├── gray-test-api/           # Gray-box (HTTP + DB) integration specs
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                    # Next.js 14 app
│   ├── src/app/                 # App Router pages (login, (dashboard), admin)
│   ├── src/components/          # Reusable UI components
│   ├── src/context/             # Auth / Notification / Company contexts
│   ├── src/hooks/               # useAuth, useCheckPermission, useNotifications…
│   ├── src/i18n/                # en/vi translation dictionaries
│   ├── src/lib/                 # menu visibility, admin access, utils
│   ├── Dockerfile
│   └── package.json
│
├── black-box-e2e/               # Playwright E2E (20 modules, 292 test cases)
├── performace_testing_script/   # k6 performance tests (smoke/load/stress/soak)
├── white-box-coverage-test-reports/   # Coverage & IEEE-829 summary reports
├── docs_diagram/                # UML class, ERD, use-case, sequence, activity diagrams
│
├── docker-compose.yml           # Root compose (backend + frontend)
├── auto_env.sh                  # Generates a minimal .env for Docker
├── auto_docker.sh               # Generates the full docker-compose.yml
├── .gitlab-ci.yml               # Full CI/CD pipeline (7 stages)
├── .github/workflows/           # GitHub Actions build workflow
├── SETUP.md                     # Step-by-step setup guide
├── CONFIG_CHECKLIST.md          # Config file checklist
├── HRM_FUNCTIONAL_REQUIREMENTS.md  # Full functional requirements spec
├── AUDIT_REPORT.md              # Cross-module integration & business-logic audit
└── package.json                 # Root workspace scripts
```

---

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 16+ (18 recommended) | Backend Docker image uses `node:18-alpine` |
| npm | 8+ | |
| [PostgreSQL](https://www.postgresql.org/) | 12+ | Required for backend |
| [Redis](https://redis.io/) | 6+ | Used by backend `CacheModule` |
| [Git](https://git-scm.com/) | any | |
| Docker & docker-compose | any | Optional — for containerized setup |

> ⚠️ **Redis is required** even in development: `app.module.ts` registers the cache with a Redis store.

---

## Quick Start (Docker)

The simplest way to run the whole stack:

```bash
git clone https://github.com/Luo-Zhii/HRM-Gene.git
cd HRM-Gene

# 1. Provide DB credentials (PostgreSQL runs on the host, not in compose)
cat > .env <<'EOF'
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hrm
EOF

# 2. Build & run backend + frontend
docker-compose up --build
```

> The compose file expects PostgreSQL to be reachable from the backend container via `host.docker.internal:5432`. Make sure a `hrm` database exists on your host Postgres first.

Access points:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

---

## Manual Setup

### 1. Backend

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# edit .env — set DB credentials, JWT secret, etc.

# Create the database (if not present)
psql -U postgres -c "CREATE DATABASE hrm;"

# (Optional) Seed sample data
npm run seed

# Start in watch mode
npm run dev
```

The backend listens on http://localhost:3001/api. See [`backend/README.md`](backend/README.md) for the API reference and troubleshooting.

### 2. Frontend

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# edit .env.local — set NEXT_PUBLIC_API_URL

npm run dev
```

The frontend starts at http://localhost:3000. See [`frontend/README.md`](frontend/README.md) for page descriptions and setup details.

### 3. Verify

```bash
# Backend responds (401 without auth is expected)
curl http://localhost:3001/api/employees/directory

# Frontend loads
open http://localhost:3000
```

For a full step-by-step guide with troubleshooting, see [`SETUP.md`](SETUP.md).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
| --- | --- | --- |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | Database user |
| `DB_PASS` | `postgres` | Database password |
| `DB_NAME` | `hrm` | Database name |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `PORT` | `3001` | Server port |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin |
| `JWT_SECRET` | *(required)* | JWT signing secret — **change in production** |
| `JWT_EXPIRATION` | `7d` | Token lifetime |
| `COMPANY_IP_WHITELIST` | `127.0.0.1,::1` | Allowed IPs for IP-based check-in |
| `NODE_ENV` | `development` | Environment |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Backend API base URL |
| `INTERNAL_API_URL` | `http://localhost:3001` | Server-side proxy target (Docker uses `http://backend:3000`) |
| `NODE_ENV` | `development` | Environment |

---

## Database Seeding

The seeder **drops and recreates the schema**, then inserts sample data (employees, departments, positions, permissions, leave types, contracts, KPIs, payroll, etc.).

```bash
cd backend
npm run seed
```

> ⚠️ `scripts/seed.ts` runs with `dropSchema: true` — this wipes the existing database. Use only for local/dev environments.

---

## Default Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `admin` |
| Employee | `user1@company.com` | `password123` |
| Employee | `user2@company.com` | `password123` |
| … | `user{N}@company.com` | `password123` |

*(Generated by `backend/scripts/seed.ts`.)*

---

## Testing

### Unit & Integration (white-box)

```bash
# Coverage for both backend and frontend
npm run test:cov

# Jest HTML reports for both
npm run test:report
```

Per-package:

```bash
cd backend && npm test            # or npm run test:cov
cd frontend && npm run test:cov
```

### Gray-box (HTTP + DB integration)

```bash
cd backend && npm run test:gray
```

Requires a running backend at `http://localhost:3001` (uses `backend/jest-gray.json`). Reports are written to `backend/gray-test-api/`.

### E2E (black-box, Playwright)

```bash
cd black-box-e2e
npm install
npx playwright install --with-deps
npm test          # Chromium + Firefox, 292 test cases
npm run report    # open HTML report
```

Test accounts: `admin@example.com` / `admin`, `hr@example.com` / `Hr@123`, `employee@example.com` / `Employee@123`. See [`black-box-e2e/README.md`](black-box-e2e/README.md).

### Performance (k6)

```bash
cd performace_testing_script
npm run smoke     # smoke / load / stress / soak
npm run k6:report # generate consolidated report
```

---

## CI/CD Pipelines

### GitLab CI (`.gitlab-ci.yml`)

Seven-stage pipeline, all jobs `allow_failure: true`:

| Stage | Jobs |
| --- | --- |
| `sast-sca` | Semgrep (SAST), Trivy (filesystem), Snyk (SCA) |
| `unit-integration-test` | White-box Jest tests + coverage |
| `deploy-staging` | docker-compose build & up |
| `gray-box-test` | Gray-box integration against staging |
| `e2e-test` | Playwright E2E (Chromium) |
| `dast` | OWASP ZAP baseline scan |
| `performance-test` | k6 smoke/load/stress/soak matrix |

### GitHub Actions (`.github/workflows/node.js.yml`)

Build-only pipeline on `main`: installs deps (`npm ci --legacy-peer-deps`) and builds both `backend` and `frontend`.

---

## Documentation

| Document | Description |
| --- | --- |
| [`SETUP.md`](SETUP.md) | Step-by-step setup guide with troubleshooting |
| [`CONFIG_CHECKLIST.md`](CONFIG_CHECKLIST.md) | Verified configuration files checklist |
| [`HRM_FUNCTIONAL_REQUIREMENTS.md`](HRM_FUNCTIONAL_REQUIREMENTS.md) | Full functional requirements (roles, modules, phases) |
| [`AUDIT_REPORT.md`](AUDIT_REPORT.md) | Cross-module integration & business-logic audit with prioritized fixes |
| [`backend/README.md`](backend/README.md) | Backend API reference & structure |
| [`frontend/README.md`](frontend/README.md) | Frontend pages & design system |
| [`black-box-e2e/README.md`](black-box-e2e/README.md) | E2E test suite guide |
| [`docs_diagram/`](docs_diagram/) | UML class, ERD, use-case, sequence & activity diagrams |
| [`white-box-coverage-test-reports/`](white-box-coverage-test-reports/) | Coverage & IEEE-829 summary reports |

---

## Access Points

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

---

## License

This project is private and confidential.

## Support

For issues or questions, contact the development team.
