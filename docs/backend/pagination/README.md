# Cursor-Based Pagination

This document describes the cursor-based (keyset) pagination system implemented across the backend. It replaces traditional offset-based pagination with a more performant approach that stays stable as data changes.

---

## Why Cursor-Based (Keyset) Pagination?

| Concern | Offset (`LIMIT / OFFSET`) | Cursor (keyset) |
|---|---|---|
| **Performance** | DB must scan and discard `OFFSET` rows — gets slower as pages grow | Uses indexed `WHERE` — constant-time regardless of page depth |
| **Stability** | Inserting/deleting rows shifts pages — users see duplicates or miss records | Cursor anchors to a specific row — pages never shift |
| **Index usage** | Partial; still scans skipped rows | Full composite-index range scan |

The cursor is a **composite key** of `(created_at, id)`. Using `created_at` gives chronological ordering, and `id` (UUID) breaks ties when two rows share the same timestamp.

---

## Database Indexes (Migration 003)

**File:** `database/supabase/migrations/003_cursor_pagination_indexes.sql`

Every table with a `created_at` column gets a **composite descending index**:

```sql
CREATE INDEX idx_<table>_created_id
  ON <table> (created_at DESC, id DESC);
```

Tables that support soft-delete (`deleted_at` column) also get a **partial index** that only includes active rows, so list endpoints that filter out deleted records use a smaller, faster index:

```sql
CREATE INDEX idx_<table>_active_created_id
  ON <table> (created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
```

### Indexed tables

| Table | Standard index | Partial (active-only) index |
|---|:-:|:-:|
| `countries` | Yes | — (no soft-delete) |
| `offices` | Yes | Yes |
| `departments` | Yes | Yes |
| `jobs` | Yes | Yes |
| `people` | Yes | Yes |
| `employees` | Yes | Yes |
| `employee_compensation` | Yes | — (no soft-delete) |
| `employee_status_history` | Yes | — (no soft-delete) |
| `attachments` | Yes | Yes |

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
│  4. Build  ListingQuery  from validated params                   │
│  5. Call use case with  ListingQueryInput                        │
├──────────────────────────────────────────────────────────────────┤
│  Use-Case Layer  (get-departments.ts)                            │
│                                                                  │
│  6. Pass  ListingQueryInput  to repository                       │
│  7. Call  PaginationHelper.processPaginatedResults  on the rows  │
│  8. Return  PaginatedResponse<ViewModel>                         │
├──────────────────────────────────────────────────────────────────┤
│  Repository Layer  (base-repository.ts / department-repo.ts)     │
│                                                                  │
│  9. Decode cursor → (created_at, id)                             │
│ 10. Build WHERE, ORDER BY, LIMIT+1 via  buildListQuery          │
│ 11. Chain domain-specific filters and joins                      │
│ 12. Execute and return rows                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Shared Listing Module

**Path:** `src/backend_lib/shared/listing/`

```
shared/listing/
  index.ts                   # Barrel exports + JSDoc overview
  pagination.ts              # Cursor encoding/decoding, PaginationQueryDTO, PaginationHelper
  listing-types.ts           # Sort and filter generic types
  listing-query-builder.ts   # Fluent ListingQuery builder + ListingQueryInput interface
```

### Cursor Encoding

The cursor is an **opaque base64 string** sent to and from the client. Internally it encodes `timestampMs:uuid`:

```
encode:  "1711929600000:550e8400-e29b-41d4-a716-446655440000"  →  base64
decode:  base64  →  { createdAt: Date, id: string }
```

Clients never need to parse the cursor — they just pass `nextCursor` back on the next request.

**Important:** When the decoded `Date` is passed to Drizzle's `sql` template literal for the cursor WHERE clause, it must be converted to an ISO string first (`.toISOString()`) and explicitly cast to `::timestamptz`. Passing a raw JavaScript `Date` object causes the pg driver to serialize it via `.toString()` (e.g. `Wed Apr 01 2026 01:55:24 GMT+0200...`), which PostgreSQL cannot parse in a row-value comparison context.

### Key Classes and Types

| Export | Kind | Purpose |
|---|---|---|
| `PaginationCursor` | const object | Static `encode(createdAt, id)` / `decode(cursor)` methods |
| `PaginationQueryDTO` | class | Validated pagination input (limit 1–100); has `getCursorData()` |
| `PaginationHelper` | class | `processPaginatedResults(rows, limit)` — trims the extra probe row, sets `hasMore` and cursors |
| `PaginatedResponse<T>` | interface | `{ data: T[], pagination: IPaginationMeta }` — standard API shape |
| `ListingQuery<F>` | class | Fluent builder for controllers (see next section) |
| `ListingQueryInput<F>` | interface | Plain object produced by the builder, consumed by services |
| `SortSpec<F>` | interface | `{ field: F, direction: 'asc' \| 'desc' }` |
| `FilterCondition<F>` | interface | `{ field: F, op: FilterOperator, value? }` |

---

## The `ListingQuery` Builder

The builder gives controllers a **fluent, type-safe API** for constructing list requests. The generic parameter `F` constrains which field names are allowed for filtering and sorting, preventing typos and invalid fields at compile time.

### Usage

```typescript
type DeptFields = 'name' | 'createdAt' | 'updatedAt' | 'parentId';

const listing = new ListingQuery<DeptFields>()
  .paginate(q.limit, q.cursor, q.direction)       // required — exactly once
  .sort({ field: q.sortBy, direction: q.sortOrder })
  .filter({ field: 'parentId', op: 'eq', value: q.parentId })
  .filter({ field: 'name', op: 'contains', value: q.name })
  .build();                                        // → ListingQueryInput<DeptFields>

await departmentService.getDepartments(listing);
```

### Design Decisions

1. **`paginate()` is mandatory** — calling `build()` without it throws. This prevents accidentally fetching unbounded result sets.
2. **`filter()` / `sort()` are optional and additive** — each call appends. Multiple filters combine with AND at the repository level.
3. **Builder stays in the controller/service layer** — domain logic and repositories receive the plain `ListingQueryInput` interface, so they are decoupled from the builder and easy to test with object literals.
4. **Type parameter `F` acts as a whitelist** — only declared field names are accepted by `filter()` and `sort()`, giving compile-time safety.

### Output Shape

`ListingQuery.build()` produces a frozen `ListingQueryInput`:

```typescript
interface ListingQueryInput<F extends string = string> {
  pagination: {
    limit: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
  };
  sort?: SortSpec<F>[];
  filters?: FilterCondition<F>[];
}
```

---

## Zod Validation Schemas

**Path:** `src/backend_lib/shared/validation/pagination-schema.ts`

A generic `basePaginationQuerySchema` provides the common pagination and sort query params with sensible defaults:

```typescript
const basePaginationQuerySchema = z.object({
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  cursor:    z.string().optional(),
  direction: z.enum(['forward', 'backward']).default('forward'),
  sortBy:    z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

Domain modules `.extend()` this schema to add their own filters and override `sortBy` with a whitelisted `z.enum`:

```typescript
// department-schema.ts
const departmentQuerySchema = basePaginationQuerySchema.extend({
  parentId: uuidOptional,
  name:     z.string().trim().optional(),
  sortBy:   z.enum(['createdAt', 'name', 'updatedAt']).default('createdAt'),
});
```

This ensures clients can only sort by columns the repository supports, and `z.coerce.number()` on `limit` handles query-string-to-number conversion automatically.

---

## Repository Layer: Dynamic Query Composition

The most important design decision is how `BaseRepository.findAll()` works with child repositories.

### The Problem

Some entities need **joins** in their list queries (e.g., departments need a `LEFT JOIN` to resolve `parentName`). But the base repository handles pagination, cursor filtering, soft-delete, and ordering generically. We need both to compose without duplication.

### The Solution: Unawaited Drizzle Builder + `$dynamic()`

`BaseRepository.findAll()` **does not await** the query. Instead it returns a Drizzle query builder with `.$dynamic()`:

```typescript
// base-repository.ts
findAll(params?: ListingQueryInput, isAudit = false): any {
  const { where, orderBy, limit } = this.buildListQuery(params, isAudit);

  return DrizzleClient
    .select()
    .from(this.table)
    .where(where.length > 0 ? and(...where) : undefined)
    .orderBy(...orderBy)
    .limit(limit)
    .$dynamic();   // ← returns the builder, not a Promise
}
```

Child repositories call `super.findAll(params)` to get the builder, then **chain** domain-specific logic before awaiting:

```typescript
// department-repository.ts
async findAll(params?, isAudit = false): Promise<DepartmentWithParentName[]> {
  const parentDepts = alias(departmentsTable, 'parent');
  const query = super.findAll(params, isAudit);   // unawaited builder

  // Add domain-specific filters
  if (params?.filters) { /* query.where(and(...extraConditions)) */ }

  // Chain join and await
  const result = await query.leftJoin(parentDepts, eq(departmentsTable.parentId, parentDepts.id));
  return result.map((row: any) => this.toDomainWithParent(row));
}
```

Simple repositories (no joins) just `await super.findAll(params)` directly.

### `buildListQuery` Helper

The protected `buildListQuery(params, isAudit)` method on `BaseRepository` converts `ListingQueryInput` into Drizzle-ready pieces:

| Piece | Logic |
|---|---|
| **`where`** | `deleted_at IS NULL` (unless `isAudit`), plus cursor condition `(created_at, id) < ($cursor_ts, $cursor_id)` for forward pagination. The decoded `Date` is serialized via `.toISOString()` and cast to `::timestamptz` for PostgreSQL compatibility. |
| **`orderBy`** | User-requested sort columns from `params.sort` come first (mapped via `this.table[field]`), then `(created_at, id)` as a mandatory tiebreaker for cursor stability. Direction (`asc`/`desc`) is respected per-column. |
| **`limit`** | `params.pagination.limit + 1` — the extra row tells us if there are more pages |

#### Sort column resolution

`buildListQuery` dynamically resolves sort field names to Drizzle columns using `this.table[s.field]`. This means the field names in `SortSpec` (e.g. `'name'`, `'createdAt'`) must match the camelCase property names on the Drizzle table definition. The Zod schema whitelist (`z.enum(['createdAt', 'name', 'updatedAt'])`) ensures only valid column names reach the repository.

Example: `?sortBy=name&sortOrder=asc` produces:

```sql
ORDER BY "departments"."name" ASC,
         "departments"."created_at" DESC,
         "departments"."id" DESC
```

The user's sort is primary; `(created_at, id)` always trails as the tiebreaker.

### Join Nesting

When Drizzle's `.leftJoin()` is chained onto a `select().from(table)` query, the result rows are **nested** by table alias:

```typescript
// row shape after leftJoin
{
  departments: { id, name, parentId, createdAt, ... },
  parent:      { id, name, ... } | null
}
```

The `toDomainWithParent` method accounts for this:

```typescript
private toDomainWithParent(row: any): DepartmentWithParentName {
  const dept   = row.departments ?? row;   // extract department fields
  const parent = row.parent;               // extract parent alias

  const department = this.toDomain(dept);
  return Object.assign(department, {
    parentName: parent?.name
      ? DepartmentName.fromDatabase(parent.name).getFormatted()
      : undefined,
  }) as DepartmentWithParentName;
}
```

---

## The "Limit + 1" Trick

Instead of running a separate `COUNT(*)` query to know if more rows exist, the repository fetches **one extra row** (`limit + 1`). If it comes back, there are more pages. `PaginationHelper.processPaginatedResults` trims that row before building the response:

```typescript
static processPaginatedResults<T extends { id: string; createdAt: Date }>(
  entities: T[],
  limit: number,
  direction = 'forward'
) {
  const hasMore = entities.length > limit;
  const items   = entities.slice(0, limit);   // trim the probe row

  const nextCursor = hasMore && items.length > 0
    ? PaginationCursor.encode(items.at(-1)!.createdAt, items.at(-1)!.id)
    : undefined;

  const prevCursor = items.length > 0
    ? PaginationCursor.encode(items[0].createdAt, items[0].id)
    : undefined;

  return { items, hasMore, nextCursor, prevCursor };
}
```

---

## API Response Shape

All paginated endpoints return:

```json
{
  "data": [ /* items */ ],
  "pagination": {
    "hasMore": true,
    "nextCursor": "MTcxMTkyOTYwMDAwMDo1NTBlODQwMC1lMjliLTQxZDQ...",
    "prevCursor": "MTcxMTkyOTYwMDAwMDo3OGNlZjJjMC05ZGE1LTRkMmQ...",
    "count": 20
  }
}
```

| Field | Description |
|---|---|
| `data` | The page of items (up to `limit`) |
| `pagination.hasMore` | `true` if there is a next page |
| `pagination.nextCursor` | Pass as `?cursor=` on the next request to load more |
| `pagination.prevCursor` | Cursor pointing to the first item of the current page (for backward navigation) |
| `pagination.count` | Number of items in `data` for this response |

---

## Request Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | number (1–100) | `20` | Page size |
| `cursor` | string | — | Opaque cursor from a previous response |
| `direction` | `forward` \| `backward` | `forward` | Pagination direction |
| `sortBy` | string (whitelisted per resource) | `createdAt` | Column to sort by |
| `sortOrder` | `asc` \| `desc` | `desc` | Sort direction |
| *(domain-specific)* | varies | — | e.g. `parentId`, `name` for departments |

---

## Adding Pagination to a New Resource

1. **Schema** — Create `<resource>QuerySchema` extending `basePaginationQuerySchema`. Override `sortBy` with `z.enum([...])` for allowed columns. Add resource-specific filter params.

2. **Service** — Accept the validated query type. Use `new ListingQuery()` to build a `ListingQueryInput`, adding `.filter()` calls for any non-empty domain-specific params.

3. **Use Case** — Accept `ListingQueryInput`. Call `repository.findAll(params)`. Pass the result through `PaginationHelper.processPaginatedResults`. Return `PaginatedResponse<ViewModel>`.

4. **Repository** — If no joins are needed, `await super.findAll(params)` works directly. If joins are needed, call `super.findAll(params)` (unawaited), chain `.leftJoin()`, then `await`. Handle domain-specific filters from `params.filters` before awaiting.

5. **Route** — Validate query params with Zod, pass to service, return the `PaginatedResponse`.

---

## File Reference

| File | Layer | Role |
|---|---|---|
| `database/supabase/migrations/003_cursor_pagination_indexes.sql` | Database | Composite indexes for pagination |
| `shared/listing/pagination.ts` | Shared | Cursor encode/decode, PaginationQueryDTO, PaginationHelper |
| `shared/listing/listing-types.ts` | Shared | Sort/filter generic types |
| `shared/listing/listing-query-builder.ts` | Shared | Fluent ListingQuery builder |
| `shared/listing/index.ts` | Shared | Barrel exports |
| `shared/validation/pagination-schema.ts` | Shared | Base Zod schema for pagination params |
| `modules/core/validation/department-schema.ts` | Validation | Department-specific query schema |
| `modules/core/domain/ports/repositories/base-repository.ts` | Domain | IBaseRepository with `findAll(ListingQueryInput)` |
| `modules/core/infrastructure/repository/base-repository.ts` | Infrastructure | Drizzle BaseRepository with `buildListQuery` |
| `modules/core/infrastructure/repository/department-repository.ts` | Infrastructure | Department repo with join composition |
| `modules/core/application/use-cases/department/get-departments.ts` | Application | Paginated department listing use case |
| `modules/core/application/services/department-service.ts` | Application | Builds ListingQuery from validated params |
| `app/api/v1/(core)/departments/route.ts` | HTTP | Route handler with Zod validation |
