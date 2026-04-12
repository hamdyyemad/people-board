# Frontend Cursor-Based Pagination

This document explains how server-side cursor pagination is wired from the API layer through to the `DataTable` component, using the **Departments** page as the canonical example.

---

## Architecture Overview

```
page.tsx  (owns params state + cursor handlers + page number state)
  └─> useDepartments(params)          ← usePaginatedQuery hook
        └─> fetchDepartments(params)  ← builds URLSearchParams, calls API
              └─> /api/v1/departments?cursor=...&limit=...
                    └─> returns Pagination<Department>
                          { data: Department[], pagination: IPaginationMeta }

page.tsx builds serverPagination = { meta, currentPage, onNext, onPrev, onLimitChange }
  └─> DataViewLayout (passes serverPagination through)
        └─> DataTable (detects serverPagination → manualPagination: true)
              └─> DataTablePagination
                    └─> ServerPaginationControls  ← Prev / Next + "Page X of Y (Z total)"
```

---

## Layer-by-Layer Explanation

### 1. Types — `src/frontend_lib/types/pagination.ts`

```ts
export interface Pagination<T> {
  data: T[];
  pagination: IPaginationMeta;
}

export interface IPaginationMeta {
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
  /** Row count in `data` for this response (after removing the probe row). */
  count: number;
  /** Total records matching current filters, ignoring pagination. Used for "Page X of Y". */
  totalCount?: number;
}

export interface ListParams {
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

Every resource that needs pagination returns `Pagination<T>` and accepts `ListParams` (or an extension of it).

---

### 2. Generic hook — `src/frontend_lib/api/config.ts`

```ts
export function usePaginatedQuery<TData, TParams extends ListParams>(
  queryKeyPrefix: QueryKey,
  fetchFn: (params: TParams) => Promise<Pagination<TData>>,
  params: TParams
) {
  return useGenericQuery<Pagination<TData>>(
    [...queryKeyPrefix, params],   // params in key → refetch on any change
    () => fetchFn(params),
    // Keep the previous page visible while the next page loads.
    // isFetching=true triggers the spinner overlay; data updates once the fetch completes.
    { placeholderData: keepPreviousData },
  );
}
```

Key behaviours:
- `params` is part of the React Query cache key — changing cursor / limit / sort triggers a fresh fetch automatically.
- `placeholderData: keepPreviousData` means the previous page stays visible during navigation (no blank flash). The spinner overlay shows via `isFetching && !isLoading`.

> **Why not remove it?** Without `keepPreviousData`, every page change sends the table into a loading skeleton (`data = undefined` → `isLoading = true`). With it, the current page stays visible behind the spinner while the next loads — the data updates once the fetch settles.

---

### 3. URL builder — `src/frontend_lib/api/params.ts`

```ts
export function buildListSearchParams(params: object): URLSearchParams {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  return search;
}
```

Strips undefined/null/empty fields so the server always sees clean query strings.

> **Note on `direction`:** The frontend sends `direction=forward` or `direction=backward` as a convenience, but the backend does not rely on it — the direction is **embedded inside the cursor itself** (`_dir` key in the base64 payload). The backend resolves direction from the cursor-embedded value when the explicit param is absent. See [`BACKWARD-PAGINATION-BUG.md`](../../backend/pagination/BACKWARD-PAGINATION-BUG.md).

---

### 4. Domain API + hook — `src/frontend_lib/api/department/`

**`api.ts`** — extends `ListParams` with department-specific filters:

```ts
export interface DepartmentListParams extends ListParams {
  sortBy?: 'createdAt' | 'name' | 'updatedAt'; // narrows server whitelist
  parentId?: string;
  name?: string;
}

export const fetchDepartments = async (
  params: DepartmentListParams = {}
): Promise<Pagination<Department>> => {
  const search = buildListSearchParams(params);
  const res = await fetch(`/api/v1/departments?${search}`);
  const data = await handleResponse<{ data: Pagination<Department> }>(res);
  return data.data;
};
```

**`queries.ts`** — the domain hook, one line:

```ts
export const useDepartments = (params: DepartmentListParams = {}) =>
  usePaginatedQuery(['departments'], fetchDepartments, params);
```

---

### 5. DataTable wiring — `src/frontend_lib/components/shared/data-table/`

#### `types.ts` — `ServerPaginationProps`

```ts
export interface ServerPaginationProps {
  meta: IPaginationMeta;
  onNext: () => void;
  onPrev: () => void;
  /** Called when the user changes the "rows per page" selector. */
  onLimitChange?: (limit: number) => void;
  /**
   * 1-indexed current page number. When provided alongside meta.totalCount,
   * the controls show "Page X of Y (Z total)".
   */
  currentPage?: number;
}
```

Added to `DataTableConfig<TData>` as `serverPagination?: ServerPaginationProps`.

#### `hook/use-data-table.ts` — `manualPagination` flag

When `serverPagination` is provided, `data-table.tsx` passes `manualPagination: true` to `useDataTable`.  
This tells TanStack Table **not** to slice the received rows — the server already returned exactly one page.

```ts
manualPagination,
...(manualPagination ? { pageCount: -1 } : {}),  // -1 = "unknown page count"
```

#### `pagination/server-pagination-controls.tsx`

Renders the cursor-aware footer:

- **Page size selector** — calls `onLimitChange(n)`, which resets cursor and page number to page 1.
- **Page info label** — shows `"Page X of Y (Z total)"` when both `currentPage` and `meta.totalCount` are present; falls back to `"N row(s)"` otherwise.
  - `totalPages = Math.ceil(meta.totalCount / currentLimit)`
- **Prev button** — disabled when `meta.prevCursor` is absent (i.e., on page 1).
- **Next button** — disabled when `meta.hasMore` is `false`.

#### `pagination/data-table-pagination.tsx`

Branches on whether `serverPagination` is present:

```tsx
serverPagination
  ? <ServerPaginationControls ... />
  : <PaginationControls table={table} />   // unchanged client-side behaviour
```

> **Memo note:** `DataTable` and `DataTablePagination` use `React.memo` with default shallow equality (no custom comparator). A previous custom comparator caused stale renders when two consecutive pages returned the same row count — the comparator returned `true` (skip) even though `serverPagination.meta` had changed, leaving the Prev button in the wrong state.

---

### 6. Page integration — `src/app/(hr)/workspace/(core)/departments/page.tsx`

This is the complete pattern every paginated page follows:

```tsx
const DEFAULT_PAGE_SIZE = 20;

function DepartmentsPageComponent() {
  // 1. Params state — single source of truth for cursor, limit, sort, filters
  const [params, setParams] = useState<DepartmentListParams>({
    limit: DEFAULT_PAGE_SIZE,
  });

  // 2. Page number — plain state, NOT sessionStorage.
  //    Resets to 1 on every component mount, which is exactly right:
  //    when the user navigates away and back, params (cursor) also resets,
  //    so the data is always page 1 and the label should match.
  const [currentPage, setCurrentPage] = useState(1);

  // 3. Fetch — React Query re-fetches whenever params changes
  const { data: { data: departments = [], pagination } = {}, isLoading, isFetching, error } =
    useDepartments(params);

  // 4. Build serverPagination — memoised so reference is stable between renders
  const serverPagination = useMemo(() => ({
    meta: pagination ?? { hasMore: false, count: 0 },
    currentPage,
    onNext: () => {
      setCurrentPage(p => p + 1);
      setParams(p => ({ ...p, cursor: pagination?.nextCursor, direction: 'forward' }));
    },
    onPrev: () => {
      setCurrentPage(p => Math.max(1, p - 1));
      setParams(p => ({ ...p, cursor: pagination?.prevCursor, direction: 'backward' }));
    },
    onLimitChange: (limit: number) => {
      setCurrentPage(1);          // reset page number
      setParams({ limit });       // reset cursor → back to page 1
    },
  }), [pagination, currentPage]);

  // 5. Pass to layout — everything else is unchanged
  return (
    <DataViewLayout
      data={departments}
      isLoading={isLoading}
      isFetching={isFetching}
      defaultPageSize={params.limit ?? DEFAULT_PAGE_SIZE}
      serverPagination={serverPagination}
      {/* ...other props */}
    />
  );
}
```

---

## Page Number Tracking

Page numbers are tracked in **plain React state** (`useState(1)`), **not** `sessionStorage`.

### Why not sessionStorage?

`sessionStorage` persists across component unmounts within the same tab. When the user navigates away and back:

- `params` state (cursor) **resets** — the component remounts, state initialises to `{limit: 20}`, and page 1 data is fetched.
- But sessionStorage still contains `page = 2` → UI would show "Page 2" while showing page 1 data.

Plain `useState` resets to `1` on unmount, keeping the displayed page number and the loaded data always in sync.

### Reset rules

| Action | `currentPage` | `cursor` |
|---|---|---|
| Component mounts (any navigation) | 1 | `undefined` |
| Click Next | `+1` | `pagination.nextCursor` |
| Click Prev | `max(1, n-1)` | `pagination.prevCursor` |
| Change page size | 1 | `undefined` |

---

## totalCount — "Page X of Y"

`meta.totalCount` comes from the backend (`COUNT(*)` run in parallel with `findAll`). The display logic in `ServerPaginationControls`:

```tsx
const totalPages = meta.totalCount != null && currentLimit > 0
  ? Math.ceil(meta.totalCount / currentLimit)
  : undefined;

// Renders: "Page 2 of 5 (98 total)"  or  "20 row(s)" as fallback
```

---

## Adding Pagination to a New Resource

Follow these steps (departments is the reference implementation):

1. **Add `ListParams` extension** in `src/frontend_lib/api/<resource>/api.ts`:
   ```ts
   export interface EmployeeListParams extends ListParams {
     sortBy?: 'name' | 'createdAt';
     departmentId?: string;
   }
   ```

2. **Add the fetch function** — use `buildListSearchParams` and return `Pagination<Employee>`.

3. **Add the query hook** in `queries.ts`:
   ```ts
   export const useEmployees = (params: EmployeeListParams = {}) =>
     usePaginatedQuery(['employees'], fetchEmployees, params);
   ```

4. **In the page component**, copy the full pattern: `useState` for params + `useState(1)` for page number → `useMemo(serverPagination)` → pass to `DataViewLayout`.

5. **No changes needed** to `DataTable`, `DataViewLayout`, or any shared component — the `serverPagination` prop handles everything.

---

## Cursor Direction Reference

| Action | `cursor` | `direction` sent | Actual direction resolved |
|---|---|---|---|
| Initial load | `undefined` | `undefined` | `forward` (default) |
| Go to next page | `pagination.nextCursor` | `'forward'` | `forward` |
| Go to previous page | `pagination.prevCursor` | `'backward'` | `backward` (also embedded in cursor) |
| Change page size | `undefined` (reset) | `undefined` | `forward` (default) |

---

## Backend Cursor Invariants (contract the frontend relies on)

The frontend's `onNext` / `onPrev` handlers depend on these guarantees from the backend:

| Guarantee | Where enforced |
|---|---|
| `nextCursor` is always present on any page where the user can navigate forward | `processPaginatedResults` |
| `nextCursor` is always present on a backward page — even when `hasMore = false` — so the user can always navigate forward again | `processPaginatedResults` |
| `prevCursor` has `_dir:'backward'` embedded in its payload — no `direction` query param required | `PaginationCursor.encode` |
| `prevCursor` is only present when there are more pages in the backward direction | `processPaginatedResults` |
| `prevCursor` is absent on page 1 (the initial load with no cursor) | `processPaginatedResults` |
| Items returned for a backward page are in the **same order** as the original forward sort | `processPaginatedResults` + `buildListQuery` |
| `pagination.totalCount` is always returned — it is the total records matching the current filters, ignoring cursor/limit | `countAll` + use-case `Promise.all` |

If any of these break, see [`BACKWARD-PAGINATION-BUG.md`](../../backend/pagination/BACKWARD-PAGINATION-BUG.md) for the algorithm and fix history.

---

## What Stays Client-Side

The following continue to work client-side within a single fetched page:

- **Global search / text filter** — `DataTableToolbar` search box
- **Column visibility toggle**
- **Row selection**
- **Export** — exports only the current page rows

If you need server-side filtering (e.g., filter by `name` sent to the API), update `params` state from the filter field's `onChange` and reset the cursor (and `currentPage` to 1), following the same pattern as `onLimitChange`.
