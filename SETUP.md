# HRM System - Complete Setup Guide

This document provides step-by-step instructions for setting up the entire HRM system (backend + frontend) from scratch.

## 📋 Prerequisites

Ensure you have installed globally:

- **Node.js** (v16+): [Download](https://nodejs.org/)
- **npm** (v8+): Comes with Node.js
- **PostgreSQL** (v12+): [Download](https://www.postgresql.org/download/)
- **Git**: [Download](https://git-scm.com/)

Verify installations:

```bash
node --version    # Should be v16 or higher
npm --version     # Should be v8 or higher
psql --version    # Should be v12 or higher
```

## 🗄️ Step 1: Database Setup

### 1a. Start PostgreSQL

**macOS (if installed via Homebrew):**

```bash
brew services start postgresql
```

**Linux (Ubuntu/Debian):**

```bash
sudo systemctl start postgresql
```

**Windows:** PostgreSQL should start automatically; check Services or start from PostgreSQL menu.

### 1b. Create Database

```bash
psql -U postgres
```

Then in the psql prompt:

```sql
CREATE DATABASE hrm;
\q
```

Verify:

```bash
psql -U postgres -d hrm -c "SELECT 1;"
```

## 🛠️ Step 2: Backend Setup

### 2a. Navigate and Install Dependencies

```bash
cd backend
npm install
```

### 2b. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```bash
# macOS/Linux
nano .env

# Or use your favorite editor (VS Code, vim, etc.)
```

**Essential settings in `.env`:**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=hrm

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT (change this in production!)
JWT_SECRET=my-secret-key-12345
JWT_EXPIRATION=7d

# Company IP for check-in
COMPANY_IP_WHITELIST=127.0.0.1,::1

# Environment
NODE_ENV=development
```

### 2c. Verify TypeScript Configuration

Check that these files exist in the backend root:

```bash
ls -la | grep -E "tsconfig|nest-cli"
```

Should show:

- ✅ `tsconfig.json`
- ✅ `tsconfig.build.json`
- ✅ `nest-cli.json`

### 2d. Start Backend Server

```bash
npm run start:dev
```

Expected output:

```
✅ HRM Backend listening on http://localhost:3001
```

**Keep this terminal open** (backend runs in watch mode).

## 🎨 Step 3: Frontend Setup

### 3a. Open New Terminal and Navigate

```bash
cd frontend
npm install
```

### 3b. Verify Frontend Configuration

Check that these files exist in the frontend root:

```bash
ls -la | grep -E "tsconfig|tailwind|postcss"
```

Should show:

- ✅ `tsconfig.json`
- ✅ `tailwind.config.js`
- ✅ `postcss.config.js`

### 3c. Start Frontend Development Server

```bash
npm run dev
```

Expected output:

```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
```

## ✅ Step 4: Verify Everything Works

### 4a. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the **HRM Login Page**.

### 4b. Test Backend APIs

In a new terminal, test the backend:

```bash
# Check if backend is responding
curl http://localhost:3001

# Should return a welcome message or error (not connection refused)
```

### 4c. Test Database Connection

```bash
# From backend root directory
curl -X GET http://localhost:3001/api/admin/settings \
  -H "Content-Type: application/json"
```

(This will likely return 401 - Unauthorized, which is expected without auth)

## 🔑 Step 5: Database Seeding (Optional)

To populate the database with sample data:

```bash
cd backend

# Create a .env file first (if not done)
cp .env.example .env

# Run seed script
npx ts-node scripts/seed.ts
```

This will create:

- Sample employees
- Departments
- Positions
- Permissions
- Leave types

## 📝 Common Commands Reference

### Backend

```bash
# Development (with auto-reload)
npm run start:dev

# Production build and start
npm run build
npm start

# Lint code
npm run lint
```

### Frontend

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🚨 Troubleshooting

### Backend won't start: "Could not find TypeScript configuration file"

**Solution:** Verify `tsconfig.json` exists:

```bash
cd backend
ls -la tsconfig.json
```

If missing, the file should have been created. If not, check backend README for manual creation.

### Backend won't start: "connect ECONNREFUSED 127.0.0.1:5432"

**Solution:** PostgreSQL isn't running.

```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Verify it's running
psql -U postgres -c "\l"
```

### Backend won't start: "password authentication failed"

**Solution:** Check `.env` database credentials match your PostgreSQL setup:

```bash
cat .env | grep DB_

# Test connection manually
psql -h localhost -U postgres -d hrm
```

### Frontend won't load: "Cannot find module 'react'"

**Solution:** Missing dependencies:

```bash
cd frontend
npm install
```

### Port 3000 or 3001 already in use

**Solution 1:** Kill the process using the port

```bash
# Find process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Find process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

**Solution 2:** Use different ports

```bash
# Backend: change PORT in .env
PORT=3002 npm run start:dev

# Frontend: Specify different port
PORT=3001 npm run dev
```

### "JWT token invalid" or login fails

**Solution:**

1. Check JWT_SECRET in `.env`:

   ```bash
   grep JWT_SECRET backend/.env
   ```

2. Ensure it's a non-empty string (not placeholder)

3. Restart backend after changing JWT_SECRET

## 🗂️ Project Structure

```
.
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── main.ts         # Entry point
│   │   ├── app.module.ts   # Root module
│   │   ├── entities/       # Database entities
│   │   └── modules/        # Feature modules
│   ├── tsconfig.json       # TypeScript config ✨
│   ├── tsconfig.build.json # Build config ✨
│   ├── nest-cli.json       # NestJS CLI config ✨
│   ├── .env.example        # Environment template
│   ├── .env                # Environment file (local)
│   ├── package.json
│   └── README.md
│
└── frontend/               # Next.js frontend
    ├── app/
    │   ├── layout.tsx
    │   ├── login/
    │   └── (dashboard)/
    │       ├── layout.tsx
    │       ├── timekeeping/
    │       ├── accounting/
    │       ├── leave/
    │       └── admin/
    ├── tsconfig.json       # TypeScript config
    ├── tailwind.config.js  # Tailwind config
    ├── postcss.config.js   # PostCSS config
    ├── package.json
    └── README.md
```

(✨ = newly created config files)

## 🔐 Security Notes

### Development

These are acceptable for local development:

```env
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
```

### Production

**NEVER use development settings in production!**

Before deploying:

1. Change JWT_SECRET to a long, random string:

   ```bash
   openssl rand -base64 32
   ```

2. Set NODE_ENV=production

3. Use a real database password

4. Disable `synchronize: true` in app.module.ts

5. Use HTTPS and set appropriate CORS origins

## 📚 Additional Resources

- **Backend Docs:** `backend/README.md`
- **Frontend Docs:** `frontend/README.md`
- **NestJS Docs:** https://docs.nestjs.com
- **Next.js Docs:** https://nextjs.org/docs
- **TypeORM Docs:** https://typeorm.io

## 🚀 You're All Set!

Your HRM system is now running!

**Access points:**

- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:3001
- 💾 Database: localhost:5432

Happy coding! 🎉

---

**Need help?** Check the individual README files or restart both servers.
