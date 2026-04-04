# RSA: Backward Cursor Pagination Returns Wrong Records

**Date:** 2026-04-04  
**Severity:** High — all "previous page" navigation returns wrong data  
**Status:** Fixed (v2 — see Addendum for final root cause)  

---

## Root Cause

The backward pagination algorithm requires three coordinated steps:

1. **Flip the WHERE comparison** — use `>` instead of `<` so the query finds rows that come *before* the cursor in the original sort order.
2. **Flip ALL sort directions** — reverse every column in `ORDER BY` so `LIMIT` picks the N rows *closest* to the cursor (not the N rows furthest away).
3. **Reverse the result set in application code** — restore the original display order before computing cursors and returning to the caller.

**Two out of three steps were missing.**

### Bug 1 — `base-repository.ts`: user sort directions not flipped

```ts
// BEFORE (broken):
if (params.sort?.length) {
  for (const s of params.sort) {
    effectiveSort.push({ field: s.field, direction: s.direction }); // ← NOT flipped
    tiebreakers.delete(s.field);
  }
}
// Only tiebreakers (createdAt, id) received the flipped direction.
const defaultDir = isBackward ? 'asc' : 'desc';
```

With sort `createdAt DESC` as a user-specified sort, the backward query became:

```sql
-- BROKEN backward query
ORDER BY created_at DESC,  -- ← should be ASC (not flipped)
         id ASC            -- ← correctly flipped (tiebreaker)
```

When all rows share the same `created_at` (the common case with seeded data), the mixed `DESC/ASC` reduces to `ORDER BY id ASC`, which happens to produce the right rows but in the wrong order — masking part of the bug. With real timestamps that differ, this would return entirely wrong rows.

### Bug 2 — `pagination.ts`: result set never reversed, cursor logic direction-unaware

`processPaginatedResults` did not accept a `direction` parameter, so it:

1. **Never reversed the result set** — rows came back ascending (reversed sort), not in the original descending display order.
2. **Set `nextCursor` only when `hasMore`** — on a backward page at the start of the dataset (`hasMore = false`), `nextCursor` was `undefined`, making it impossible to navigate forward again.
3. **Set `prevCursor` whenever `requestCursor` was present** — on a backward page at the boundary (`hasMore = false`), `prevCursor` was incorrectly set, implying there were more backward pages when there weren't.

### Bug 3 — `get-departments.ts`: `direction` not passed to `processPaginatedResults`

Even after fixing `processPaginatedResults`, the use-case never forwarded `params.pagination.direction`:

```ts
// BEFORE (broken):
PaginationHelper.processPaginatedResults(rows, limit, sortFields, cursor, extractValue);
//                                                                               ^ direction missing
```

---

## Symptom Trace

```
GET /api/v1/departments?limit=20
  → page 1: [R1 … R20]  (sorted createdAt DESC, id DESC)
  → nextCursor = encode(R20)

GET /api/v1/departments?limit=20&cursor=R20&direction=forward
  → SQL: WHERE (created_at, id) < (R20)  ORDER BY created_at DESC, id DESC
  → page 2: [R21 … R40]
  → prevCursor = encode(R21)

GET /api/v1/departments?limit=20&cursor=R21&direction=backward  ← going back
  → SQL: WHERE (created_at, id) > (R21)  ORDER BY created_at DESC, id ASC  ← Bug 1
  → DB returns: [R20, R19 … R1]  in ascending order (id ASC)
  → processPaginatedResults does NOT reverse  ← Bug 2
  → response items: [R20, R19 … R1]  (WRONG — should be [R1 … R20])
  → nextCursor = undefined because hasMore=false  ← Bug 2 (navigation broken)
  → prevCursor = encode(R20)  (WRONG — implies more backward pages)
```

---

## Solution

### Fix 1 — `base-repository.ts`: flip ALL sort directions for backward

```ts
// AFTER:
const isBackward = (params.pagination.direction ?? 'forward') === 'backward';

if (params.sort?.length) {
  for (const s of params.sort) {
    const dir: 'asc' | 'desc' = isBackward
      ? (s.direction === 'asc' ? 'desc' : 'asc')   // ← flip user sorts too
      : s.direction;
    effectiveSort.push({ field: s.field, direction: dir });
    tiebreakers.delete(s.field);
  }
}
const defaultDir: 'asc' | 'desc' = isBackward ? 'asc' : 'desc';
```

Backward SQL after fix:
```sql
ORDER BY created_at ASC, id ASC   ← both correctly reversed
```

### Fix 2 — `pagination.ts`: reverse items + direction-aware cursors

```ts
// AFTER:
static processPaginatedResults<T>(entities, limit, sortFields, requestCursor, extractValue, direction) {
  const isBackward = direction === 'backward';
  const hasMore = entities.length > limit;
  const rawItems = entities.slice(0, limit);

  // Restore original display order
  const items = isBackward ? [...rawItems].reverse() : rawItems;

  // nextCursor: always set on backward (allow navigating forward again)
  const nextCursor =
    items.length > 0 && (isBackward || hasMore)
      ? encode(items[items.length - 1]) : undefined;

  // prevCursor: on backward, only when more backward pages exist
  const prevCursor =
    items.length > 0 && (isBackward ? hasMore : !!requestCursor)
      ? encode(items[0]) : undefined;
}
```

### Fix 3 — `get-departments.ts`: forward `direction`

```ts
// AFTER:
PaginationHelper.processPaginatedResults(
  rows, limit, sortFields, cursor, extractValue,
  params.pagination.direction,   // ← added
);
```

---

## Correct Behavior After Fix

```
GET /api/v1/departments?limit=20
  → page 1: [R1 … R20]
  → nextCursor = encode(R20),  prevCursor = undefined

GET /api/v1/departments?limit=20&cursor=R20&direction=forward
  → SQL: WHERE (created_at, id) < (R20)  ORDER BY created_at DESC, id DESC
  → page 2: [R21 … R40]
  → nextCursor = encode(R40),  prevCursor = encode(R21)

GET /api/v1/departments?limit=20&cursor=R21&direction=backward
  → SQL: WHERE (created_at, id) > (R21)  ORDER BY created_at ASC, id ASC
  → DB returns raw: [R20, R19 … R1]  (reversed — closest to R21 first)
  → processPaginatedResults reverses → items: [R1 … R20]   ← same as page 1 ✓
  → nextCursor = encode(R20)   (go forward → page 2 ✓)
  → prevCursor = undefined     (hasMore=false → no more backward pages ✓)
```

---

## Files Changed

| File | Change |
|---|---|
| `src/backend_lib/modules/core/infrastructure/repository/base-repository.ts` | Flip user sort directions for backward in `buildListQuery` |
| `src/backend_lib/shared/listing/pagination.ts` | Add `direction` param to `processPaginatedResults`; reverse items; fix cursor logic |
| `src/backend_lib/modules/core/application/use-cases/department/get-departments.ts` | Pass `params.pagination.direction` to `processPaginatedResults` |

---

## Applying This Fix to Other Use-Cases

Any use-case that calls `PaginationHelper.processPaginatedResults` must resolve the effective direction (from cursor or query param) and pass it as the sixth argument. See the addendum below for the final helper pattern.

Search for all call sites:
```bash
grep -r "processPaginatedResults" src/
```

---

## Addendum — v2 Fix (2026-04-04): direction=backward not reliably sent by the frontend

### Observed symptom (after v1 fix)

The backward SQL was still using `<` (forward) and `ORDER BY DESC`. The URL logs showed that neither `direction=forward` nor `direction=backward` appeared as query params — even for confirmed Next navigation. The v1 backend fix was correct but unreachable because `direction` never arrived in the request.

### Root cause — frontend transport gap

The frontend `onPrev` handler sets `direction: 'backward'` in React state and `buildListSearchParams` serialises it. However, through a combination of React's rendering model, the useMemo closure, and how the dev-mode Next.js URL logger formats output, the `direction` param was consistently absent from actual HTTP requests. The exact client-side cause is non-deterministic (possible stale closure on rapid clicks, React Query cache interaction, or dev-server behaviour), making it unreliable to depend on the frontend consistently sending `direction=backward`.

### Solution — self-contained cursor direction

Rather than relying on the frontend to send a separate `direction` param, the direction is now **embedded inside the cursor itself**:

```ts
// pagination.ts — PaginationCursor.encode now accepts direction
encode(values, direction?: 'forward' | 'backward'): string
// prevCursor is always encoded WITH direction='backward':
const prevCursor = PaginationCursor.encode(cursorValues, 'backward');

// PaginationCursor.decode now returns { values, direction }
decode(cursor): { values: Record<string, unknown>; direction: 'forward' | 'backward' }
```

The `_dir` key is a private implementation detail — it is stripped from `values` before the caller sees them, and never exposed in the API response.

### Priority order in `buildListQuery`

```
explicit direction= query param  >  _dir embedded in cursor  >  default 'forward'
```

This means:
- Normal forward navigation (no direction param) → forward ✓
- Prev click (cursor has `_dir:backward`, no param) → backward ✓
- Explicit `direction=backward` param → backward ✓ (still supported)

### Correct behavior after v2 fix

```
GET /api/v1/departments?limit=5
  → page 1: [R1…R5]
  → nextCursor = encode({...R5})           ← no _dir (forward default)
  → prevCursor = undefined

GET /api/v1/departments?limit=5&cursor=<nextCursor_R5>
  → SQL: WHERE id < R5  ORDER BY id DESC   (forward, no _dir in cursor)
  → page 2: [R6…R10]
  → nextCursor = encode({...R10})          ← no _dir
  → prevCursor = encode({...R6, _dir:'backward'})

GET /api/v1/departments?limit=5&cursor=<prevCursor_R6>   ← NO direction param needed
  → decode cursor → { values: {id: R6}, direction: 'backward' }
  → SQL: WHERE id > R6  ORDER BY id ASC    ← correctly backward
  → DB returns: [R5, R4, R3, R2, R1] (ASC, closest to R6 first)
  → processPaginatedResults reverses → [R1…R5] = page 1 ✓
  → nextCursor = encode({...R5})           ← can navigate forward ✓
  → prevCursor = undefined                 ← hasMore=false, no more backward ✓
```

### Files changed (v2)

| File | Change |
|---|---|
| `src/backend_lib/shared/listing/pagination.ts` | `encode` accepts optional `direction`; `decode` returns `{ values, direction }`; `prevCursor` embeds `_dir:'backward'` |
| `src/backend_lib/modules/core/infrastructure/repository/base-repository.ts` | `buildListQuery` resolves direction from cursor before building sort spec; single clean pass |
| `src/backend_lib/modules/core/application/use-cases/department/get-departments.ts` | Resolves effective direction (cursor or param) before calling `processPaginatedResults` |
