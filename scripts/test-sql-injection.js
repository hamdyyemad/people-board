/**
 * SQL injection sanity check for POST /api/v1/departments
 *
 * Run (with the app on http://localhost:3000):
 *   node scripts/test-sql-injection-departments.js
 *
 * If the route requires auth, set COOKIE or AUTHORIZATION in the script or use
 * curl with -b "cookie=..." or -H "Authorization: Bearer ...".
 *
 * Expected: All requests either succeed (201) with the payload stored as the
 * department name, or fail with validation/4xx. No 500 from DB syntax errors,
 * and no actual SQL execution (e.g. table drop, sleep).
 */

const BASE = 'http://localhost:3000/api/v1/departments';

const PAYLOADS = [
  { name: "'; DROP TABLE departments; --", description: "Classic DROP TABLE" },
  { name: "' OR '1'='1", description: "Boolean-style" },
  { name: "\" OR 1=1 --", description: "Double-quote boolean" },
  { name: "1; SELECT pg_sleep(2); --", description: "Time-based (would hang if executed)" },
  { name: "\\'; TRUNCATE departments; --", description: "Escape + TRUNCATE" },
  { name: "name'); DELETE FROM departments WHERE '1'='1", description: "Break out of value" },
];

async function run() {
  console.log('POST', BASE);
  console.log('Expect: 201 or 4xx, payload stored as literal. No DB errors.\n');

  for (const { name, description } of PAYLOADS) {
    try {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: null }),
      });
      const text = await res.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
      const status = res.status;
      const ok = status >= 200 && status < 300 ? '✓' : '✗';
      console.log(`${ok} [${status}] ${description}`);
      console.log(`   name: ${JSON.stringify(name)}`);
      if (status === 201 && body?.data?.name !== undefined) {
        console.log(`   stored name: ${JSON.stringify(body.data.name)}`);
      } else if (body?.detail || body?.message) {
        console.log(`   response: ${body.detail || body.message}`);
      }
      console.log('');
    } catch (err) {
      console.log(`✗ Error: ${err.message}\n`);
    }
  }

  console.log('Done. If all payloads were stored as literal names or rejected by validation, SQL injection is not possible here.');
}

run();
