// ---------------------------------------------------------------------------
// tests/main-test.js — Single entry point for all workload types.
//
// Credentials are synced with backend/scripts/seed.ts:
//   Admin  → admin@example.com  / admin
//   User   → user1@company.com  / password123   (… user39@company.com)
//
// Usage:
//   k6 run -e TEST_TYPE=smoke  -e TARGET_URL=http://localhost:3000 tests/main-test.js
//   k6 run -e TEST_TYPE=load   -e TARGET_URL=https://staging.example.com tests/main-test.js
//   k6 run -e TEST_TYPE=stress -e TARGET_URL=http://localhost:3000 tests/main-test.js
//   k6 run -e TEST_TYPE=soak   -e TARGET_URL=http://localhost:3000 tests/main-test.js
//
//   Omit TEST_TYPE to default to "smoke".
//   Omit TARGET_URL to default to "http://localhost:3000".
// ---------------------------------------------------------------------------
import { group, check, sleep } from 'k6';

import { visitLoginPage, submitAuth, fetchDashboard } from '../api/auth.js';
import * as workloads from '../config/workloads.js';
export { handleSummary } from '../utils/reporter.js';

// ── Runtime configuration (injected via -e flags) ──────────────────────────
const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:3000';
const TEST_TYPE  = __ENV.TEST_TYPE  || 'smoke';

// Match the seeded credentials from backend/scripts/seed.ts.
// Each VU picks randomly between admin and a regular user to simulate
// realistic mixed traffic (Director vs Staff roles).
const SEEDED_USERS = [
  { email: 'admin@example.com', password: 'admin'           }, // System Admin (Director)
  { email: 'user1@company.com', password: 'password123'     }, // Regular Staff
  { email: 'user5@company.com', password: 'password123'     },
  { email: 'user10@company.com', password: 'password123'    },
  { email: 'user20@company.com', password: 'password123'    },
];

function pickUser() {
  return SEEDED_USERS[Math.floor(Math.random() * SEEDED_USERS.length)];
}

// ── Dynamically select the workload preset ─────────────────────────────────
const workload = workloads[TEST_TYPE];
if (!workload) {
  throw new Error(
    `Unknown TEST_TYPE "${TEST_TYPE}". Valid values: ${Object.keys(workloads).join(', ')}`,
  );
}
export const options = workload;

// ── Step-level assertion helper ────────────────────────────────────────────
function assertOk(res, step, expectStatus) {
  check(res, {
    [`${step} – status ${expectStatus}`]: (r) => r.status === expectStatus,
    [`${step} – duration < 1000 ms`]:    (r) => r.timings.duration < 1000,
  });
}

// ── Critical user journey ──────────────────────────────────────────────────
export default function () {
  // Pick a random seeded user per VU iteration to simulate mixed-role traffic
  const user = pickUser();
  let res;

  // ——— Step 1: Visit Login page (Next.js frontend) ————————————————————————
  group('01 – Visit Login', () => {
    res = visitLoginPage(TARGET_URL);
    assertOk(res, 'GET /login', 200);
  });
  sleep(1);

  // ——— Step 2: Submit Auth credentials (NestJS API + DB) ———————————————————
  // Sends {"email":"...","password":"..."} matching the Employee entity
  // seeded in backend/scripts/seed.ts (bcrypt-hashed passwords).
  group('02 – Submit Auth', () => {
    res = submitAuth(TARGET_URL, user.email, user.password);
    // Accept 201 (session created) or 200 (existing session / ok).
    check(res, {
      'POST /api/auth/login – status 200 or 201': (r) =>
        r.status === 200 || r.status === 201,
      'POST /api/auth/login – duration < 1000 ms': (r) =>
        r.timings.duration < 1000,
    });
  });
  sleep(1);

  // ——— Step 3: Fetch Dashboard (heavy DB queries on payslips, KPIs, …) ————
  group('03 – Fetch Dashboard', () => {
    res = fetchDashboard(TARGET_URL);
    assertOk(res, 'GET /api/dashboard', 200);
  });
  sleep(1);
}
