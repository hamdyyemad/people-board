# Backend shared layer

The `src/backend_lib/shared/` folder holds cross-cutting concerns used by API routes, middlewares, and optionally by domain/application layers. All of it is designed to work with the **global error handler** so that thrown errors become consistent, RFC 7807–style JSON responses.

---

## Folder structure

```
shared/
  adapters/         # Framework adapter — ONLY place that imports next/server (or Nest later)
    current.ts     # Re-exports the active adapter (change to nest when migrating)
    next.ts        # Next.js implementation (getPath, getHeader, createJsonResponse, setResponseHeader)
  exceptions/      # Base and HTTP-status errors (extend for domain)
  http/            # HTTP response types and helpers (use adapter, no framework import)
    types/         # SuccessResponse, ErrorResponse, ProblemDetails
    response.ts    # createSuccessResponse, createErrorResponse, createErrorResponseFromDetails
  middlewares/     # Composable route middlewares (use adapter types only)
  utils/           # Generic helpers (e.g. rate limiter store, client id)
```

---

## Framework adapter (no tight coupling to Next.js)

Shared code does **not** import from `next/server`. All request/response handling goes through **`shared/adapters/`**:

- **`adapters/next.ts`** – The only file that imports `NextRequest` / `NextResponse` from `next/server`. It exports:
  - `FrameworkRequest`, `FrameworkResponse` (type aliases)
  - `getPath(request)`, `getHeader(request, name)`
  - `createJsonResponse(body, options?)`, `setResponseHeader(response, name, value)`
- **`adapters/current.ts`** – Re-exports from `next.ts`. **When you move to NestJS**, only change this file to re-export from `./nest` (and add `adapters/nest.ts` with the same interface implemented using Nest’s Request/Response).

Response helpers and middlewares use these adapter functions and types only, so they stay framework-agnostic. Route files can keep using `NextRequest` today; when you migrate, you’ll replace the route layer and point `current.ts` at the Nest adapter.

---

## 1. Exceptions

**Path:** `shared/exceptions`  
**Import:** `import { BaseError, NotFoundError, ValidationError, ... } from '@/backend_lib/exceptions'`

- **BaseError** – Base class for all custom errors. Sets `statusCode`, `type`, `title`, `timestamp` for RFC 7807.
- **Typed errors** – `ValidationError` (400), `NotFoundError` (404), `UnauthorizedError` (401), `ForbiddenError` (403), `InternalServerError` (500).

**Use in domain:** Prefer extending these in domain exception modules so the global error middleware can return the right status and body without extra mapping.

```ts
// e.g. domain/exceptions/department-exceptions.ts
import { NotFoundError, BaseError, ValidationError } from '@/backend_lib/exceptions';

export class DepartmentNotFoundError extends NotFoundError { ... }
export class DuplicateDepartmentNameError extends BaseError { ... }  // 409
export class InvalidDepartmentHierarchyError extends ValidationError { ... }
```

Then in use cases or services, throw these; the **error handler middleware** will catch them and return a consistent error response. No need to catch and map in the route.

---

## 2. HTTP (types + response helpers)

**Path:** `shared/http/`  
**Types:** `import type { SuccessResponse, ErrorResponse } from '@/backend_lib/http/types'` or `@/backend_lib/types/api-response`  
**Helpers:** `import { createSuccessResponse, createErrorResponse } from '@/backend_lib/http/response'`

- **Types** – `BaseApiResponse`, `SuccessResponse<T>`, `ErrorResponse`, `ProblemDetails` (RFC 7807).
- **createSuccessResponse(request, data, status?)** – Builds a success JSON response with `success`, `status`, `timestamp`, `path`, `data`.
- **createErrorResponse(request, baseError, headers?)** – Builds an error response from a `BaseError` instance.
- **createErrorResponseFromDetails(request, type, title, status, detail, headers?)** – Builds an error response from raw fields (e.g. in middlewares).

Use **createSuccessResponse** in route handlers for a consistent success shape. Use **createErrorResponse** only if you need to return an error manually; normally the **error handler middleware** does this when you throw a `BaseError`.

---

## 3. Middlewares

**Path:** `shared/middlewares`  
**Import:** `import { withMiddlewares, withErrorHandler, withRateLimit, ... } from '@/backend_lib/middlewares'`

- **withMiddlewares(handler)** – Composes, in order (outer to inner): **error handler** → **rate limit** → **authentication** → **authorization** → your handler. Use this to wrap each route that should have rate limiting, auth, and unified error handling.
- **withErrorHandler** – Catches thrown errors; if the error is a `BaseError`, returns RFC 7807 JSON; otherwise returns a 500 problem detail.
- **withRateLimit** – Enforces in-memory rate limits and returns 429 with `Retry-After` when exceeded.
- **withAuthentication** / **withAuthorization** – Stubs for now; add JWT/session and permission checks here.

**Usage:** Wrap the route handler per route. Do **not** put `withMiddlewares` inside a single global `middleware.ts`; that file runs for the whole app and has a different signature. Instead, export the wrapped handler from each route file.

```ts
// app/api/v1/(core)/departments/route.ts
import { withMiddlewares } from '@/backend_lib/middlewares';
import { createSuccessResponse } from '@/backend_lib/http/response';

async function createDepartment(request: NextRequest) {
  const department = await departmentService.createDepartment(...);
  return createSuccessResponse(request, { id: department.id, ... }, 201);
}

export const POST = withMiddlewares(createDepartment);
```

For routes that need a different stack (e.g. no auth), compose the middlewares you need instead of using `withMiddlewares`.

---

## 4. Utils (rate limiter)

**Path:** `shared/utils/rate-limiter`  
**Import:** `import { getClientId, checkRateLimit, RATE_LIMIT_MAX_REQUESTS } from '@/backend_lib/utils/rate-limiter'`

- **getClientId(request)** – Derives a client id (e.g. from `x-forwarded-for` / `x-real-ip`) for rate limiting.
- **checkRateLimit(clientId)** – Returns `{ allowed, remaining, resetAt }`; uses an in-memory store (consider Redis for multi-instance).

Used by **withRateLimit** middleware; you typically don’t call these from routes directly.

---

## Path aliases (tsconfig)

| Alias | Resolves to |
|-------|-------------|
| `@/backend_lib/exceptions` | `shared/exceptions` |
| `@/backend_lib/types/*` | `shared/http/types/*` |
| `@/backend_lib/http/*` | `shared/http/*` |
| `@/backend_lib/middlewares` | `shared/middlewares` |
| `@/backend_lib/utils/*` | `shared/utils/*` |

Adapter is used only inside shared; routes don’t need to import it unless you want to type the handler argument as `FrameworkRequest`.

---

## Summary

- **Domain exceptions:** Extend shared `BaseError` / `NotFoundError` / `ValidationError` (and friends) so the global error handler can return consistent RFC 7807 responses.
- **Routes:** Use **withMiddlewares(handler)** per route and **createSuccessResponse** for success bodies; let the error handler turn thrown `BaseError`s into error responses.
- **Custom stacks:** Import individual middlewares from `@/backend_lib/middlewares` and compose them as needed.
