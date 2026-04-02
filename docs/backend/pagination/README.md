# Cursor-Based Pagination (Backend)

This document describes the **compound-cursor keyset pagination** system implemented across the backend. It replaces traditional offset-based pagination with a more performant approach that stays stable as data changes and supports **arbitrary multi-column sorting**.

---

## Why Cursor-Based (Keyset) Pagination?

| Concern | Offset (`LIMIT / OFFSET`) | Cursor (keyset) |
|---|---|---|
| **Performance** | DB must scan and discard `OFFSET` rows — gets slower as pages grow | Uses indexed `WHERE` — constant-time regardless of page depth |
| **Stability** | Inserting/deleting rows shifts pages — users see duplicates or miss records | Cursor anchors to a specific row — pages never shift |
| **Index usage** | Partial; still scans skipped rows | Full composite-index range scan |

---

## Compound Cursors

### The Problem with Simple Cursors

A cursor that only encodes `(createdAt, id)` breaks when the `ORDER BY` uses a different column (e.g. `name`). The cursor position in `(createdAt, id)` space doesn't correspond to a stable position in `name` space — records reappear across pages.

### The Solution

The cursor encodes **exactly the columns that appear in ORDER BY**. If the query sorts by `name ASC, createdAt DESC, id DESC`, the cursor stores:

```json
{"name": "Department X", "createdAt": 1775001324774, "id": "abc-123"}
```

This is base64-encoded into an opaque string that the client passes back. The key invariant:

> **ORDER BY columns == cursor columns == WHERE row-value columns**

The `(createdAt, id)` tiebreakers are always appended last by the repository if not already present in the user's sort specification.

### Wire Format

```
encode:  JSON.stringify({name:"Dept X", createdAt:1775001324774, id:"abc-123"})  →  base64
decode:  base64  →  JSON.parse  →  Record<string, unknown>
```

`Date` values are serialised as epoch-milliseconds so they survive the round-trip without precision loss. Clients never parse the cursor — they just pass `nextCursor` back on the next request.

---

## Multi-Column Sorting

### Query Parameter Format

`sortBy` and `sortOrder` accept **comma-separated** values:

```
GET /api/v1/departments?sortBy=name,createdAt&sortOrder=asc,desc&limit=20
```

This produces: `ORDER BY name ASC, created_at DESC, id DESC` (the repository always appends any missing tiebreakers).

If `sortOrder` has fewer elements than `sortBy`, the last provided direction repeats for the remaining columns:

```
?sortBy=name,createdAt,updatedAt&sortOrder=asc
→ name ASC, createdAt ASC, updatedAt ASC, id ASC
```

### Zod Validation

The base schema splits comma-separated strings into arrays and validates each direction element:

```typescript
// pagination-schema.ts
sortBy:    z.string().default('createdAt').transform(v => v.split(',').map(s => s.trim())),
sortOrder: z.string().default('desc').transform(v =>
  v.split(',').map(s => s.trim())
).refine(
  arr => arr.every(d => d === 'asc' || d === 'desc'),
  { message: 'Each sortOrder value must be "asc" or "desc"' }
),
```

Domain schemas override `sortBy` with a whitelist per resource:

```typescript
// department-schema.ts
const ALLOWED_DEPT_SORT_FIELDS = ['createdAt', 'name', 'updatedAt', 'parentName'] as const;

sortBy: z.string().default('createdAt').transform(v =>
  v.split(',').map(s => s.trim())
).refine(
  arr => arr.every(f => ALLOWED_DEPT_SORT_FIELDS.includes(f)),
  { message: `sortBy must be one of: ${ALLOWED_DEPT_SORT_FIELDS.join(', ')}` }
),
```

---

## Database Indexes

### Migration 003 — Default Tiebreaker Indexes

**File:** `database/supabase/migrations/003_cursor_pagination_indexes.sql`

Every table gets a composite `(created_at DESC, id DESC)` index. Tables with soft-delete also get a partial variant:

```sql
CREATE INDEX idx_<table>_created_id ON <table> (created_at DESC, id DESC);
CREATE INDEX idx_<table>_active_created_id ON <table> (created_at DESC, id DESC) WHERE deleted_at IS NULL;
```

### Migration 004 — Compound Sort Indexes

**File:** `database/supabase/migrations/004_compound_sort_indexes.sql`

Each additional sortable column gets a compound index ending with `(created_at, id)` so the keyset WHERE clause uses a single index scan:

```sql
-- Example: departments sorted by name
CREATE INDEX idx_departments_name_created_id ON departments (name ASC, created_at DESC, id DESC);
CREATE INDEX idx_departments_name_active     ON departments (name ASC, created_at DESC, id DESC) WHERE deleted_at IS NULL;
```

### Indexed Tables Summary

| Table | Sort Columns Indexed | Active-Only Partial |
|---|---|:-:|
| `departments` | `name`, `updated_at` | Yes |
| `jobs` | `title`, `updated_at` | Yes |
| `offices` | `name`, `updated_at` | Yes |
| `countries` | `name`, `iso_code` | — (no soft-delete) |
| `people` | `first_name`, `last_name`, `email`, `updated_at` | Yes |
| `employees` | `employee_no`, `status`, `type`, `contract_start`, `updated_at` | Yes |
| `attachments` | `file_name`, `updated_at` | Yes |

All tables also have the base `(created_at, id)` index from migration 003.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  HTTP Layer  (route.ts)                                          │
│                                                                  │
│  1. Parse query params                                           │
│  2. Validate with Zod  (departmentQuerySchema)                   │
│  3. Pass validated data to service                               │
├──────────────────────────────────────────────────────────────────┤
│  Service Layer  (department-service.ts)                           │
│                                                                  │
│  4. Iterate sortBy[]/sortOrder[] arrays → .sort() each pair      │
│  5. Build  ListingQuery  → ListingQueryInput                     │
│  6. Call use case                                                │
├──────────────────────────────────────────────────────────────────┤
│  Use-Case Layer  (get-departments.ts)                            │
│                                                                  │
│  7. Pass  ListingQueryInput  to repository                       │
│  8. Read  repo.lastSortFields  for cursor column list            │
│  9. Call  PaginationHelper.processPaginatedResults               │
│     with sortFields + extractValue callback                      │
│ 10. Return  PaginatedResponse<ViewModel>                         │
├──────────────────────────────────────────────────────────────────┤
│  Repository Layer  (base-repository.ts / department-repo.ts)     │
│                                                                  │
│ 11. buildListQuery:                                              │
│     a. Merge user sorts + (createdAt, id) tiebreakers            │
│     b. Decode compound cursor → column-value map                 │
│     c. Build row-value WHERE: (col1,col2) < (val1,val2)          │
│     d. Build ORDER BY from effective sort                        │
│     e. Record sortFields for cursor encoding                     │
│ 12. Chain domain-specific filters and joins                      │
│ 13. Execute and return rows                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Shared Listing Module

**Path:** `src/backend_lib/shared/listing/`

```
shared/listing/
  index.ts                   # Barrel exports + JSDoc overview
  pagination.ts              # Compound cursor encoding/decoding, PaginationQueryDTO, PaginationHelper
  listing-types.ts           # Sort and filter generic types
  listing-query-builder.ts   # Fluent ListingQuery builder + ListingQueryInput interface
```

### Key Classes and Types

| Export | Kind | Purpose |
|---|---|---|
| `PaginationCursor` | const object | `encode(values: Record<string, unknown>)` / `decode(cursor): Record<string, unknown>` |
| `PaginationQueryDTO` | class | Validated pagination input (limit 1–100); has `getCursorData()` |
| `PaginationHelper` | class | `processPaginatedResults(rows, limit, sortFields, requestCursor?, extractValue?)` |
| `PaginatedResponse<T>` | interface | `{ data: T[], pagination: IPaginationMeta }` — standard API shape |
| `ListingQuery<F>` | class | Fluent builder for controllers |
| `ListingQueryInput<F>` | interface | Plain object produced by the builder, consumed by services |
| `SortSpec<F>` | interface | `{ field: F, direction: 'asc' \| 'desc' }` |
| `FilterCondition<F>` | interface | `{ field: F, op: FilterOperator, value? }` |

---

## The `ListingQuery` Builder

### Usage

```typescript
const listing = new ListingQuery()
  .paginate(q.limit, q.cursor, q.direction)
  .sort({ field: 'name', direction: 'asc' })
  .sort({ field: 'createdAt', direction: 'desc' })
  .filter({ field: 'parentId', op: 'eq', value: q.parentId })
  .build();
```

### How the Service Iterates Multi-Sort

```typescript
async getDepartments(q: DepartmentQuery) {
  let builder = new ListingQuery()
    .paginate(q.limit, q.cursor, q.direction);

  // q.sortBy = ['name', 'createdAt'], q.sortOrder = ['asc', 'desc']
  for (let i = 0; i < q.sortBy.length; i++) {
    const dir = q.sortOrder[i] ?? q.sortOrder[q.sortOrder.length - 1] ?? 'desc';
    builder = builder.sort({ field: q.sortBy[i], direction: dir });
  }
  // ...filters...
  return useCase.execute(builder.build());
}
```

### Design Decisions

1. **`paginate()` is mandatory** — calling `build()` without it throws.
2. **`filter()` / `sort()` are optional and additive** — each call appends. Multiple filters combine with AND at the repository level.
3. **Builder stays in the controller/service layer** — repositories receive the plain `ListingQueryInput`.
4. **Type parameter `F` acts as a whitelist** — only declared field names compile.

---

## Repository Layer: Dynamic Query Composition

### Unawaited Drizzle Builder + `$dynamic()`

`BaseRepository.findAll()` **does not await** the query. It returns a Drizzle query builder:

```typescript
findAll(params?: ListingQueryInput, isAudit = false): any {
  const { where, orderBy, limit } = this.buildListQuery(params, isAudit);
  return DrizzleClient
    .select().from(this.table)
    .where(where.length > 0 ? and(...where) : undefined)
    .orderBy(...orderBy)
    .limit(limit)
    .$dynamic();
}
```

Child repositories chain domain-specific logic before awaiting:

```typescript
async findAll(params?, isAudit = false): Promise<DepartmentWithParentName[]> {
  const query = super.findAll(params, isAudit);
  // ...extra filters...
  const result = await query.leftJoin(this.parentAlias, eq(departmentsTable.parentId, this.parentAlias.id));
  return result.map((row: any) => this.toDomainWithParent(row));
}
```

### `resolveColumn` Hook

The base repository resolves sort/cursor field names to Drizzle columns via `this.table[field]`. For joined or computed columns, child repositories override `resolveColumn`:

```typescript
// base-repository.ts
protected resolveColumn(field: string): any {
  return this.table[field];
}

// department-repository.ts
private readonly parentAlias = alias(departmentsTable, 'parent');

protected resolveColumn(field: string): any {
  if (field === 'parentName') return this.parentAlias.name;
  return super.resolveColumn(field);
}
```

This allows `sortBy=parentName` to resolve to the joined `parent.name` column for both ORDER BY and compound cursor WHERE clauses.

### `buildListQuery` Helper

`buildListQuery(params, isAudit)` converts `ListingQueryInput` into Drizzle-ready pieces:

| Piece | Logic |
|---|---|
| **Effective sort** | User sorts first, then `(createdAt, id)` as tiebreakers (if not already present). Each field is resolved via `resolveColumn()`. |
| **Cursor WHERE** | Decodes the compound cursor JSON, builds a **row-value comparison** `(col1, col2, ...) < (val1, val2, ...)` over all effective sort columns. Timestamp fields use `date_trunc('milliseconds', col)` + `::timestamptz` cast. |
| **ORDER BY** | Maps effective sort to `asc(col)` / `desc(col)`. Skips unresolvable fields. |
| **Limit** | `params.pagination.limit + 1` — the extra row detects `hasMore`. |
| **sortFields** | Recorded on the repository instance via `lastSortFields` so the use case can pass it to `processPaginatedResults`. |

### Row-Value Comparison Example

For `?sortBy=name,createdAt&sortOrder=asc,desc`:

```sql
WHERE (
  "departments"."name",
  date_trunc('milliseconds', "departments"."created_at"),
  "departments"."id"
) < ($cursor_name, $cursor_ts::timestamptz, $cursor_id)
ORDER BY "departments"."name" ASC,
         "departments"."created_at" DESC,
         "departments"."id" DESC
LIMIT 21
```

### Timestamp Precision

JavaScript `Date` has millisecond precision, but PostgreSQL `timestamptz` stores microseconds. Without alignment, records at `774.123μs` would fail comparison against a cursor of `774.000ms`. The solution: `date_trunc('milliseconds', col)` normalises the stored timestamp before comparison.

### Join Nesting

When `.leftJoin()` is chained, Drizzle nests result rows by table alias:

```typescript
{ departments: { id, name, ... }, parent: { id, name, ... } | null }
```

`toDomainWithParent` handles this:

```typescript
private toDomainWithParent(row: any): DepartmentWithParentName {
  const dept   = row.departments ?? row;
  const parent = row.parent;
  const department = this.toDomain(dept);
  return Object.assign(department, {
    parentName: parent?.name ? DepartmentName.fromDatabase(parent.name).getFormatted() : undefined,
  });
}
```

---

## Use Case: Cursor Encoding with Value Objects

Domain entities may wrap fields in value objects (e.g. `DepartmentName`). The `processPaginatedResults` function accepts an optional `extractValue` callback to unwrap them:

```typescript
const { items, hasMore, nextCursor, prevCursor } = PaginationHelper.processPaginatedResults(
  rows,
  params.pagination.limit,
  sortFields,
  params.pagination.cursor,
  (row, field) => {
    if (field === 'name') return row.name.value;  // unwrap DepartmentName VO
    return (row as Record<string, any>)[field];
  }
);
```

---

## The "Limit + 1" Trick

Instead of a separate `COUNT(*)`, the repository fetches **one extra row**. If it comes back, `hasMore` is `true`. `processPaginatedResults` trims it before building the response.

### `prevCursor` Semantics

`prevCursor` is only emitted when the client sent a `cursor` parameter — meaning they navigated past page 1. On the very first page (no cursor), `prevCursor` is omitted since there is nothing to go back to.

---

## API Response Shape

```json
{
  "data": [ /* items */ ],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJuYW1lIjoiRGVwYXJ0bWVudCAxNTYxMiIsImNyZWF0ZWRBdCI6...",
    "prevCursor": "eyJuYW1lIjoiQnJhbmQiLCJjcmVhdGVkQXQiOjE3NzQxNzY3ODA4...",
    "count": 20
  }
}
```

| Field | Description |
|---|---|
| `data` | The page of items (up to `limit`) |
| `pagination.hasMore` | `true` if there is a next page |
| `pagination.nextCursor` | Pass as `?cursor=` on the next request |
| `pagination.prevCursor` | Cursor for the first item of the current page (omitted on page 1) |
| `pagination.count` | Number of items in `data` for this response |

---

## Request Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | number (1–100) | `20` | Page size |
| `cursor` | string | — | Opaque cursor from a previous response |
| `direction` | `forward` \| `backward` | `forward` | Pagination direction |
| `sortBy` | comma-separated string | `createdAt` | Columns to sort by (whitelisted per resource) |
| `sortOrder` | comma-separated string | `desc` | Sort direction per column (`asc` or `desc`) |
| *(domain-specific)* | varies | — | e.g. `parentId`, `name` for departments |

### Examples

```
# Default: newest first
GET /api/v1/departments?limit=20

# Alphabetical by name
GET /api/v1/departments?limit=20&sortBy=name&sortOrder=asc

# Multi-column: name ascending, then newest first
GET /api/v1/departments?limit=20&sortBy=name,createdAt&sortOrder=asc,desc

# Page 2 using cursor from previous response
GET /api/v1/departments?limit=20&sortBy=name&sortOrder=asc&cursor=eyJuYW1l...&direction=forward

# Filter by parent + sort
GET /api/v1/departments?limit=20&sortBy=name&sortOrder=asc&parentId=359da22f-...
```

---

## Adding Pagination to a New Resource

1. **Schema** — Create `<resource>QuerySchema` extending `basePaginationQuerySchema`. Override `sortBy` with a `.transform().refine()` whitelist. Add resource-specific filter params.

2. **Service** — Accept the validated query type. Iterate `sortBy[]`/`sortOrder[]` arrays to call `.sort()` for each pair. Add `.filter()` calls for non-empty domain-specific params.

3. **Use Case** — Accept `ListingQueryInput`. Call `repository.findAll(params)`. Read `repo.lastSortFields`. Pass both to `PaginationHelper.processPaginatedResults` with an `extractValue` callback if the entity uses value objects. Return `PaginatedResponse<ViewModel>`.

4. **Repository** — If no joins are needed, `await super.findAll(params)` works directly. If joins are needed, call `super.findAll(params)` (unawaited), chain `.leftJoin()`, then `await`. Override `resolveColumn` for any joined/computed sort fields. Handle domain-specific filters from `params.filters` before awaiting.

5. **Route** — Validate query params with Zod, pass to service, return the `PaginatedResponse`.

6. **Indexes** — Add compound indexes `(sort_col, created_at DESC, id DESC)` and partial active-only variants in a new migration.

---

## File Reference

| File | Layer | Role |
|---|---|---|
| `database/supabase/migrations/003_cursor_pagination_indexes.sql` | Database | Base `(created_at, id)` composite indexes |
| `database/supabase/migrations/004_compound_sort_indexes.sql` | Database | Per-column compound sort indexes |
| `shared/listing/pagination.ts` | Shared | Compound cursor encode/decode, PaginationHelper |
| `shared/listing/listing-types.ts` | Shared | Sort/filter generic types |
| `shared/listing/listing-query-builder.ts` | Shared | Fluent ListingQuery builder |
| `shared/listing/index.ts` | Shared | Barrel exports |
| `shared/validation/pagination-schema.ts` | Shared | Base Zod schema (comma-separated sortBy/sortOrder) |
| `modules/core/validation/department-schema.ts` | Validation | Department-specific query schema with whitelist |
| `modules/core/domain/ports/repositories/base-repository.ts` | Domain | IBaseRepository with `findAll` + `lastSortFields` |
| `modules/core/infrastructure/repository/base-repository.ts` | Infrastructure | Drizzle BaseRepository with `buildListQuery` + `resolveColumn` |
| `modules/core/infrastructure/repository/department-repository.ts` | Infrastructure | Department repo with join composition + `resolveColumn` override |
| `modules/core/application/use-cases/department/get-departments.ts` | Application | Paginated listing use case with compound cursor encoding |
| `modules/core/application/services/department-service.ts` | Application | Builds ListingQuery from validated multi-sort params |
| `app/api/v1/(core)/departments/route.ts` | HTTP | Route handler with Zod validation |
