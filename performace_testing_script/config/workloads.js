// ---------------------------------------------------------------------------
// config/workloads.js — Pre-built k6 scenario + threshold presets.
//
// Every preset shares the same guardrails:
//   • 99th-percentile request latency must stay under 1 000 ms
//   • failure rate must stay below 2 %
//   • self-signed / staging TLS certificates are tolerated
// ---------------------------------------------------------------------------

// ── Global thresholds applied to every workload ────────────────────────────
const GUARDRAILS = {
  http_req_duration: ['p(99)<1000'],
  http_req_failed:   ['rate<0.02'],
};

// Staging environments often use self-signed certs.
const TLS = { insecureSkipTLSVerify: true };

// ── Smoke — 2 VUs, 10 s (quick sanity gate) ───────────────────────────────
export const smoke = {
  thresholds: GUARDRAILS,
  insecureSkipTLSVerify: TLS.insecureSkipTLSVerify,
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 2,
      duration: '10s',
      tags: { workload: 'smoke' },
    },
  },
};

// ── Load — 0 → 50 VUs (30 s), plateau 1 m, ramp-down 30 s ─────────────────
export const load = {
  thresholds: GUARDRAILS,
  insecureSkipTLSVerify: TLS.insecureSkipTLSVerify,
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m',  target: 50 },
        { duration: '30s', target: 0  },
      ],
      gracefulRampDown: '10s',
      tags: { workload: 'load' },
    },
  },
};

// ── Stress — 0 → 150 VUs (30 s), hold 30 s, ramp-down 30 s ────────────────
export const stress = {
  thresholds: GUARDRAILS,
  insecureSkipTLSVerify: TLS.insecureSkipTLSVerify,
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 150 },
        { duration: '30s', target: 150 },
        { duration: '30s', target: 0   },
      ],
      gracefulRampDown: '10s',
      tags: { workload: 'stress' },
    },
  },
};

// ── Soak — 20 VUs, 2 min (memory / connection-pool drift check) ────────────
export const soak = {
  thresholds: GUARDRAILS,
  insecureSkipTLSVerify: TLS.insecureSkipTLSVerify,
  scenarios: {
    soak: {
      executor: 'constant-vus',
      vus: 20,
      duration: '2m',
      tags: { workload: 'soak' },
    },
  },
};
