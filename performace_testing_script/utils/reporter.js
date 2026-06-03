// ---------------------------------------------------------------------------
// utils/reporter.js — Summary output handler.
//
// 1. Prints the standard text summary to stdout (CI log visibility).
// 2. Writes an HTML report via benc-uk/k6-reporter to ./summary_perf.html.
//
// To wire this into a test file just re-export:
//   export { handleSummary } from '../utils/reporter.js';
// ---------------------------------------------------------------------------
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export function handleSummary(data) {
  return {
    // Human-readable text summary printed to the terminal / CI log
    stdout: textSummary(data, { indent: '  ', enableColors: true }),

    // HTML artifact picked up by gitlab-ci.yml as $K6_PERF_REPORT
    './summary_perf.html': htmlReport(data, {
      title: `HRM Performance Report – ${new Date().toISOString()}`,
    }),
  };
}
