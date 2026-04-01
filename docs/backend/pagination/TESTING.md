# Pagination Testing Guide

Manual test cases for the cursor-based pagination system. All requests target `GET /api/v1/departments` as the reference endpoint. Adapt the same patterns for other paginated resources.

**Base URL:** `http://localhost:3000/api/v1/departments`

---

## Prerequisites

Seed your database with enough records to test pagination boundaries. For meaningful tests with the default page size of 20, you need **at least 25 departments** (enough to span more than one page).

A mix of:
- Top-level departments (`parentId` is null)
- Sub-departments (with a valid `parentId`)
- At least 2 departments with the same `created_at` timestamp (to test tie-breaking on `id`)
- At least 1 soft-deleted department (`deleted_at` is not null)

---

## 1. Default Request (No Params)

```
GET /api/v1/departments
```

**Expected:**
- Returns up to 20 items (default `limit`)
- Sorted by `createdAt DESC` (newest first) — default `sortBy` and `sortOrder`
- `pagination.hasMore` is `true` if total rows > 20
- `pagination.nextCursor` is present when `hasMore` is `true`
- `pagination.prevCursor` is present (points to the first item)
- `pagination.count` equals the number of items in `data`
- No soft-deleted departments appear in the results

---

## 2. Custom Limit

```
GET /api/v1/departments?limit=5
```

**Expected:**
- Returns exactly 5 items (assuming >= 6 exist)
- `pagination.hasMore` is `true`
- `pagination.nextCursor` is set

### Edge: limit=1

```
GET /api/v1/departments?limit=1
```

**Expected:**
- Returns 1 item
- `hasMore` is `true` (assuming >= 2 exist)

### Edge: limit larger than total rows

```
GET /api/v1/departments?limit=100
```

**Expected (assuming < 100 departments):**
- Returns all active departments
- `pagination.hasMore` is `false`
- `pagination.nextCursor` is `undefined`

### Validation: limit out of range

```
GET /api/v1/departments?limit=0
GET /api/v1/departments?limit=101
GET /api/v1/departments?limit=-5
GET /api/v1/departments?limit=abc
```

**Expected:**
- 400 or 422 validation error from Zod (`limit` must be int between 1 and 100)

---

## 3. Forward Pagination (Walking Pages)

This is the core use case. Fetch page 1, use `nextCursor` to get page 2, repeat.

### Page 1

```
GET /api/v1/departments?limit=5
```

**Save** `pagination.nextCursor` from the response (e.g. `"MTcxMTkyOTYwMDAwMDo1NTBl..."`).

### Page 2

```
GET /api/v1/departments?limit=5&cursor=<nextCursor from page 1>
```

**Verify:**
- Items are different from page 1 (no overlap)
- Items are older (lower `createdAt`) than the last item on page 1
- `pagination.prevCursor` points to page 2's first item

### Page 3, 4, ... until the end

Keep passing `nextCursor` until `pagination.hasMore` is `false`.

**Verify on the last page:**
- `pagination.hasMore` is `false`
- `pagination.nextCursor` is `undefined`
- `pagination.count` may be less than `limit`

### Full walkthrough check

Walk all pages and collect every `id`. Verify:
- No duplicates across any page
- Total collected items equals the number of active (non-deleted) departments
- Items are strictly ordered by `(createdAt DESC, id DESC)` across all pages

---

## 4. Backward Pagination

```
GET /api/v1/departments?limit=5&cursor=<prevCursor from page 2>&direction=backward
```

**Expected:**
- Returns items that are **newer** than the cursor (the page before)
- Items are in `ASC` order (oldest to newest) — the consumer reverses for display
- This gives you "previous page" functionality

### Edge: backward with no cursor

```
GET /api/v1/departments?limit=5&direction=backward
```

**Expected:**
- Returns the **oldest** 5 items (ascending order from the bottom of the dataset)
- Useful for "jump to last page" in a DataTable

---

## 5. Sorting

### Sort by name ascending

```
GET /api/v1/departments?sortBy=name&sortOrder=asc
```

**Expected:**
- Items ordered alphabetically A → Z
- Pagination still works correctly (cursors based on `createdAt/id`, order applied separately)

### Sort by updatedAt descending

```
GET /api/v1/departments?sortBy=updatedAt&sortOrder=desc
```

### Validation: invalid sortBy

```
GET /api/v1/departments?sortBy=deletedAt
GET /api/v1/departments?sortBy=randomColumn
```

**Expected:**
- 400/422 validation error — `sortBy` must be one of `createdAt`, `name`, `updatedAt`

---

## 6. Filtering

### Filter by parentId

```
GET /api/v1/departments?parentId=<uuid of a top-level department>
```

**Expected:**
- Only sub-departments under the given parent are returned
- `pagination.count` matches the number of children

### Filter by name (partial, case-insensitive)

```
GET /api/v1/departments?name=eng
```

**Expected:**
- Returns departments whose name contains "eng" (e.g. "Engineering", "engine room")
- Case-insensitive match (`ilike`)

### Combined: filter + pagination

```
GET /api/v1/departments?name=eng&limit=2
```

**Expected:**
- Returns at most 2 matching departments
- `hasMore` is `true` if there are more matching departments
- Walking pages with `nextCursor` should only return departments matching "eng"

### Filter by empty parentId

```
GET /api/v1/departments?parentId=
```

**Expected:**
- `parentId` transforms to `null` via the Zod union — does **not** fail validation
- Returns all departments (parentId filter not applied when null)

---

## 7. Combined: Pagination + Sort + Filter

```
GET /api/v1/departments?limit=3&sortBy=name&sortOrder=asc&name=dep
```

Walk pages to verify:
- All items match the name filter
- Items are sorted by name ascending
- No duplicates across pages
- `hasMore` eventually becomes `false`

---

## 8. Cursor Integrity

### Invalid cursor

```
GET /api/v1/departments?cursor=not-valid-base64!!!
GET /api/v1/departments?cursor=dGVzdA==
```

**Expected:**
- 500 or domain error: "Failed to decode cursor" (the cursor decodes to something that doesn't match `timestamp:uuid` format)
- Consider adding cursor validation to the Zod schema (`.superRefine`) for a cleaner 400 response

### Stale cursor (row deleted after cursor was created)

1. Fetch page 1, save `nextCursor`
2. Delete the row the cursor points to
3. Fetch page 2 using the stale cursor

**Expected:**
- Should still work — cursor-based pagination uses `<` / `>` comparison, so even if the exact row is gone, the next row in sequence is returned
- No duplicates, no skipped rows

### Cursor from a different limit

1. Fetch `?limit=5`, get `nextCursor`
2. Use that cursor with `?limit=10&cursor=<cursor>`

**Expected:**
- Works correctly — cursor position is independent of page size
- Returns up to 10 items starting from after the cursor

---

## 9. Soft-Delete Exclusion

### Verify deleted records are hidden

1. Soft-delete a department (set `deleted_at`)
2. Fetch `GET /api/v1/departments`

**Expected:**
- The soft-deleted department does **not** appear in results
- `pagination.count` does not include it

### Verify isAudit includes deleted records

If you have an audit endpoint or pass `isAudit=true` internally:

**Expected:**
- Soft-deleted departments are included
- Their `deletedAt` field is not null

---

## 10. Empty Results

### No records match filter

```
GET /api/v1/departments?name=xyznonexistent
```

**Expected:**
```json
{
  "data": [],
  "pagination": {
    "hasMore": false,
    "count": 0
  }
}
```

- `nextCursor` and `prevCursor` are `undefined`

### Empty table

If you have a test environment with no departments:

```
GET /api/v1/departments
```

**Expected:**
- `data` is `[]`
- `pagination.hasMore` is `false`
- `pagination.count` is `0`

---

## 11. Concurrency (Insert During Pagination)

1. Fetch page 1 (`?limit=5`), save `nextCursor`
2. Insert a new department (it gets the newest `created_at`)
3. Fetch page 2 using `nextCursor`

**Expected:**
- Page 2 returns the correct next items — no duplicates
- The newly inserted department appears on page 1 if you refetch it (it's newer than the cursor)
- This is a key advantage over offset-based pagination

---

## 12. Response Structure Verification

For every successful response, verify the JSON shape:

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "parentId": "uuid | null",
        "parentName": "string | undefined",
        "createdAt": "ISO date",
        "updatedAt": "ISO date",
        "isActive": true
      }
    ],
    "pagination": {
      "hasMore": "boolean",
      "nextCursor": "string | undefined",
      "prevCursor": "string | undefined",
      "count": "number"
    }
  }
}
```

- `data.data` items have `parentName` resolved (from the LEFT JOIN), not raw `parentId` only
- `isActive` is always `true` for non-audit queries (soft-deleted rows are excluded)
- Dates are ISO 8601 strings

---

## Quick Reference: cURL Examples

```bash
# Page 1 — defaults
curl "http://localhost:3000/api/v1/departments"

# Page 1 — explicit params
curl "http://localhost:3000/api/v1/departments?limit=5&direction=forward&sortBy=createdAt&sortOrder=desc"

# Page 2 — using cursor from page 1
curl "http://localhost:3000/api/v1/departments?limit=5&cursor=MTcxMTkyOTYwMDAwMDo1NTBl..."

# Filter by name
curl "http://localhost:3000/api/v1/departments?name=engineering"

# Filter by parent + small page
curl "http://localhost:3000/api/v1/departments?parentId=<uuid>&limit=3"

# Sort by name ascending
curl "http://localhost:3000/api/v1/departments?sortBy=name&sortOrder=asc"

# Last page (backward, no cursor)
curl "http://localhost:3000/api/v1/departments?limit=5&direction=backward"
```

---

## Checklist Summary

| # | Test Case | Pass |
|---|---|---|
| 1 | Default request returns up to 20 items, newest first | |
| 2 | Custom limit works (1, 5, 100) | |
| 3 | Invalid limit returns validation error | |
| 4 | Forward pagination: walk all pages, no duplicates | |
| 5 | Last page: `hasMore=false`, no `nextCursor` | |
| 6 | Backward pagination returns older-to-newer items | |
| 7 | Backward with no cursor returns last page | |
| 8 | Sort by name/updatedAt works | |
| 9 | Invalid sortBy returns validation error | |
| 10 | Filter by parentId returns children only | |
| 11 | Filter by name is case-insensitive partial match | |
| 12 | Filter + pagination combined works | |
| 13 | Empty parentId does not fail validation | |
| 14 | Invalid cursor returns error | |
| 15 | Stale cursor still works after row deletion | |
| 16 | Cursor is page-size independent | |
| 17 | Soft-deleted records are excluded | |
| 18 | Empty result returns `data: [], hasMore: false` | |
| 19 | Insert during pagination causes no duplicates | |
| 20 | Response shape matches expected JSON structure | |
