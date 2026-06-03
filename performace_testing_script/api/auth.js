// ---------------------------------------------------------------------------
// api/auth.js — HTTP call wrappers for the HRM critical user journey.
//
// Token extraction matches the actual NestJS response contract defined in
// backend/src/modules/auth/auth.controller.ts line 40:
//   return { success: true, user: user, access_token: tokenData.access_token };
//
// The JWT is also set as an httpOnly cookie "access_token", but k6 VUs pass
// it via the Authorization: Bearer header so it works without cookie jar.
// ---------------------------------------------------------------------------
import http from 'k6/http';

// Module-level token store — each k6 VU gets its own JS context, so this is
// safely scoped per-VU without cross-iteration contamination.
let sharedAuthToken = null;

/**
 * Step 1 — Simulate the Next.js frontend login page load.
 * @param {string} baseUrl
 * @returns {object} k6 http response
 */
export function visitLoginPage(baseUrl) {
  return http.get(`${baseUrl}/login`, {
    headers: { Accept: 'text/html' },
  });
}

/**
 * Step 2 — POST credentials to POST /api/auth/login.
 * Extracts access_token from the JSON body on success (200/201).
 *
 * Backend contract (auth.controller.ts:40):
 *   { success: true, user: {...}, access_token: "<JWT>" }
 *
 * @param {string} baseUrl
 * @param {string} email
 * @param {string} password
 * @returns {object} k6 http response
 */
export function submitAuth(baseUrl, email, password) {
  const payload = JSON.stringify({ email, password });
  const res = http.post(`${baseUrl}/api/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status === 200 || res.status === 201) {
    try {
      const body = res.json();
      // access_token is snake_case — matches NestJS return statement exactly
      sharedAuthToken = body.access_token || null;
    } catch (_) {
      sharedAuthToken = null;
    }
  } else {
    sharedAuthToken = null;
  }

  return res;
}

/**
 * Step 3 — Fetch the heavy dashboard endpoint (simulates complex DB queries).
 * Forwards the bearer token extracted during login.
 *
 * @param {string} baseUrl
 * @returns {object} k6 http response
 */
export function fetchDashboard(baseUrl) {
  const headers = { Accept: 'application/json' };
  if (sharedAuthToken) {
    headers['Authorization'] = `Bearer ${sharedAuthToken}`;
  }

  return http.get(`${baseUrl}/dashboard`, { headers });
}
