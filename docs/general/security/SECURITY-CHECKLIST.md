# Security checklist (codebase scan)

This doc summarizes security-related findings from scanning the codebase and what to check or fix.

---

## Critical

### 1. Authentication and authorization are not implemented

**Where:** `src/backend_lib/shared/middlewares/authentication.ts`, `authorization.ts`

**Finding:** Both middlewares are stubs that always call the handler. No JWT/session/API-key check, no permission checks.

**Impact:** All API routes (e.g. `POST /api/v1/departments`) are effectively **unauthenticated and unauthorized**. Anyone can create/access resources.

**Action:**

- Implement authentication (e.g. JWT, session, or API key) in `withAuthentication` and return 401 when missing/invalid.
- Implement authorization (e.g. RBAC, resource-level checks) in `withAuthorization` and return 403 when forbidden.
- Ensure every API route that should be protected is wrapped with these middlewares (or equivalent).

---

### 2. Unhandled errors expose internal messages to the client

**Where:** `src/backend_lib/shared/middlewares/error-handler.ts`

**Finding:** For non-`BaseError` exceptions, the handler returns `error.message` in the response body. That can leak stack traces, file paths, or DB details (e.g. `"value.trim is not a function"`, driver errors).

**Action:** Return a generic message to the client for unhandled errors (e.g. "An unexpected error occurred") and log the real error server-side only. A fix is applied so production responses use a generic message.

---

### 3. Request body not validated before use

**Where:** `src/app/api/v1/(core)/departments/route.ts`

**Finding:** The route does `const body = await request.json()` and passes `name` and `parentId` directly to the service. No schema validation (e.g. Zod). If `name` is not a string (e.g. number, object), `DepartmentName` throws and the client may see the raw error message (see #2).

**Action:**

- Add request validation (e.g. Zod schema) and return 400 with a clear message for invalid payloads.
- Ensure invalid JSON is caught and mapped to 400, not 500.

---

## High

### 4. Rate limit client ID can be spoofed

**Where:** `src/backend_lib/shared/utils/rate-limiter/client-identifier.ts`

**Finding:** Client ID is taken from `X-Forwarded-For` or `X-Real-IP`. If the app is not strictly behind a trusted proxy that sets these, an attacker can send arbitrary values and bypass or dilute rate limiting.

**Action:**

- Use a trusted reverse proxy (e.g. Vercel, Cloudflare) that overwrites these headers from the real client IP.
- Document that the app must not be called without such a proxy, or add a fallback (e.g. socket IP when not behind proxy) and treat proxy as the source of truth when present.

---

### 5. Rate limit store is in-memory

**Where:** `src/backend_lib/shared/utils/rate-limiter/rate-limit-store.ts`

**Finding:** A single `Map` in process memory is used. With multiple instances (e.g. serverless, multiple pods), limits are per-instance, so effective rate limit is multiplied by instance count.

**Action:** For production with multiple instances, use a shared store (e.g. Redis) and keep the same limits and window semantics.

---

### 6. Security headers are minimal

**Where:** `vercel.json` (and no security headers in Next.js config/middleware)

**Finding:** Only `X-Frame-Options: DENY` is set. Missing: `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, etc.

**Action:** Add security headers in `vercel.json` or in Next.js middleware/headers config (e.g. `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` for HTTPS, and a CSP if applicable).

---

## Medium / good to fix

### 7. Database URL not validated at startup

**Where:** `src/backend_lib/modules/core/infrastructure/databases/drizzle-client.ts`

**Finding:** `process.env.DATABASE_URL!` is used without check. If missing, the app may fail at first DB use with an opaque error.

**Action:** Validate required env vars at startup (or when building the client) and fail fast with a clear message.

---

### 8. No explicit CORS policy

**Finding:** No CORS configuration was found. Next.js/Vercel defaults may allow same-origin only; if you add custom API domains or SPA origins, configure CORS explicitly.

**Action:** If the API is consumed by other origins, set `Access-Control-Allow-Origin` (and related headers) explicitly; avoid wildcard in production if credentials are used.

---

## Low / already in good shape

### 9. SQL injection

**Status:** Mitigated by Drizzle’s parameterized queries. No raw SQL with string interpolation was found. See `docs/backend/SQL-INJECTION-TESTING.md` for verification steps.

---

### 10. XSS and `dangerouslySetInnerHTML`

**Finding:** All uses of `dangerouslySetInnerHTML` found are for static content (theme script, static CSS). No user-controlled input is rendered there.

**Action:** Keep it that way; do not inject user or request data into `dangerouslySetInnerHTML` without sanitization.

---

### 11. Redirects and `window.location`

**Finding:** Redirects use Next.js `redirect()` or fixed `window.location.href` with built URL. No user input was observed in redirect targets in a way that would cause open redirect.

**Action:** When adding new redirects, avoid building the target URL from user input (e.g. query, body) without allowlisting or validation.

---

The **xlsx** package (used for Excel import/export in the data table) has **no patched version on npm** for:

- **GHSA-4r6h-8v6p-xvw6** – Prototype pollution (vulnerable &lt;0.19.3)
- **GHSA-5pgg-2g8v-p4x9** – ReDoS (vulnerable &lt;0.20.2)

The official `xlsx` package on npm is at 0.18.x; patched versions exist in other distributions (e.g. SheetJS Pro/CE) but not as the default `xlsx` npm package.

**Options:**

1. **Accept risk (short term):** Use is limited to **client-side** import/export of user-chosen files. Ensure you never parse untrusted Excel from the server or from unauthenticated users; that reduces (but does not remove) exposure.
2. **Replace with another library:** e.g. **exceljs** (MIT), which has a different API but supports read/write of xlsx. Migrate the code in `src/frontend_lib/components/shared/data-table/` (toolbar export + import modal) to use it.

### xlsx replaced with exceljs

The **xlsx** package was removed and replaced with **exceljs** (MIT) for Excel import/export in the data table (`utils.ts` export + `data-table-import-modal.tsx` template download and file validation). This clears the previous xlsx-related audit findings (prototype pollution, ReDoS).


## What to do next

1. **Critical:** Implement auth and authz; fix error handler to not leak `error.message`; add request validation for API bodies.
2. **High:** Harden rate limiting (trusted proxy + shared store); add security headers.
3. **Ongoing:** Run `pnpm audit` (or `npm audit`) and fix important dependency vulnerabilities; re-scan after major changes.
