# DataTable Component

A fully-featured, generic data table built on `@tanstack/react-table` v8.

**Location:** `src/frontend_lib/components/shared/DataTable/`

**⚠️ Current Status:** Client-side only. See [Server-Side Migration Plan](../../general/migration/SERVER-SIDE-DATATABLE-MIGRATION.md) for planned backend integration.

**🚀 Future:** Will be extracted as a standalone npm library package.

---

## File structure

```
DataTable/
├── index.ts                        ← Public exports
├── types.ts                        ← Shared TypeScript types
├── utils.ts                        ← Export helpers (CSV, XLSX, JSON)
├── DataTable.tsx                   ← Main orchestrator component
├── DataTableToolbar.tsx            ← Search, view toggle, column visibility, import, export
├── DataTableColumnHeader.tsx       ← Column header with sort/filter/hide context menu
├── DataTableColumnFilterModal.tsx  ← Per-column filter dialog (6 condition modes)
├── DataTablePagination.tsx         ← Page size selector + prev/next navigation
├── DataTableRowActions.tsx         ← ⋯ per-row action dropdown
├── DataTableSkeleton.tsx           ← Column-matched loading skeleton
└── DataTableImportModal.tsx        ← 3-step bulk import flow
```

---

## Quick start

```tsx
"use client";

import { DataTable } from "@/frontend_lib/components/shared/data-table";
import { DataTableColumnHeader } from "@/frontend_lib/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface User {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
];

export default function UsersPage() {
  return <DataTable columns={columns} data={data} />;
}
```

---

## Props reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `ColumnDef<TData>[]` | required | TanStack column definitions |
| `data` | `TData[]` | required | Array of row data |
| `isLoading` | `boolean` | `false` | Shows column-matched skeleton instead of table |
| `defaultPageSize` | `number` | `20` | Initial rows per page |
| `enableRowSelection` | `boolean` | `true` | Show checkboxes and selection state |
| `enableColumnVisibility` | `boolean` | `true` | Show the Columns toggle button |
| `enableExport` | `boolean` | `true` | Show the Export button (CSV / XLSX / JSON) |
| `enableImport` | `boolean` | `false` | Show the Import button (opens 3-step modal) |
| `enableViewToggle` | `boolean` | `true` | Show the view mode toggle buttons |
| `exportFileName` | `string` | `"export"` | Base filename for downloads and import modal title |
| `importTemplateColumns` | `string[]` | — | Required column names for import validation and template |
| `filterFields` | `DataTableFilterField<TData>[]` | `[]` | Column filter metadata (currently informational) |
| `gridCard` | `(row: TData) => ReactNode` | — | Card renderer — enables Grid view toggle button |
| `listCard` | `(row: TData) => ReactNode` | — | Row renderer — enables List view toggle button |
| `rowActions` | `(row: TData, table) => ReactNode` | — | Content for the ⋯ row dropdown |
| `onRowClick` | `(row: TData) => void` | — | Called when a row is clicked |
| `onImport` | `(rows: TData[]) => void` | — | Called with validated rows after import is confirmed |

---

## Loading skeleton

Pass `isLoading={true}` to automatically show a skeleton that matches the exact
column structure — same widths, checkbox column, and actions column.

```tsx
<DataTable
  columns={columns}
  data={data}
  isLoading={isFetching}
/>
```

The skeleton can also be used standalone:

```tsx
import { DataTableSkeleton } from "@/frontend_lib/components/shared/data-table";

// Column-matched (recommended)
<DataTableSkeleton columns={columns} rowCount={8} />

// Generic fallback
<DataTableSkeleton columnCount={5} rowCount={10} />
```

`DataTableSkeleton` props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `ColumnDef<TData>[]` | — | Actual columns for exact width matching |
| `columnCount` | `number` | `5` | Fallback column count when `columns` not provided |
| `rowCount` | `number` | `8` | Number of skeleton rows |
| `enableRowSelection` | `boolean` | `true` | Include checkbox column |
| `enableRowActions` | `boolean` | `true` | Include actions column |

---

## Column header — sort, filter, hide

Use `DataTableColumnHeader` to get the full context menu on every column:

```tsx
import { DataTableColumnHeader } from "@/frontend_lib/components/shared/data-table";

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
];
```

The header button opens a dropdown with:
- **Sort Ascending** / **Sort Descending** — active item highlighted in primary colour
- **Clear Sort** — only shown when sorted
- **Filter…** — opens the per-column filter modal
- **Clear Filter** — only shown when a filter is active
- **Hide Column**

### Filter indicator

When a column has an active filter, the header button turns **primary colour** and
shows a small **filled dot** next to the sort icon. The dot also appears next to
"Filter…" in the dropdown menu.

The toolbar shows a **Reset filters** button whenever any column filter or global
search is active. Clicking it clears everything at once.

---

## Per-column filter modal

Clicking **Filter…** in a column header opens `DataTableColumnFilterModal`.

Six condition modes are available:

| Mode | Behaviour |
|---|---|
| Contains | Cell value includes the input string |
| Equals | Cell value exactly matches |
| Starts with | Cell value begins with the input |
| Ends with | Cell value ends with the input |
| Is empty | Cell value is blank |
| Is not empty | Cell value is not blank |

The filter value is stored in TanStack's `columnFilters` state as `"mode:value"`
(e.g. `"startsWith:eng"`). The custom `columnFilterFn` in `DataTable.tsx` parses
this format at render time.

---

## View modes — Table, List, Grid

The toolbar shows toggle buttons for whichever view modes are enabled via props:

| View | Enabled by | Layout |
|---|---|---|
| Table | Always | Full `<table>` with headers |
| List | `listCard` prop provided | Vertical stack of row cards |
| Grid | `gridCard` prop provided | Responsive card grid |

```tsx
function UserListCard({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border px-4 py-3">
      <p className="font-medium">{user.name}</p>
      <p className="text-sm text-muted-foreground">{user.email}</p>
    </div>
  );
}

function UserGridCard({ user }: { user: User }) {
  return (
    <Card>
      <CardContent>{user.name}</CardContent>
    </Card>
  );
}

<DataTable
  columns={columns}
  data={data}
  enableViewToggle
  listCard={(user) => <UserListCard user={user} />}
  gridCard={(user) => <UserGridCard user={user} />}
/>
```

---

## Row actions

Pass a render function to `rowActions`. Use a factory function to keep the
callback reference stable across re-renders:

```tsx
import { CrudOperation } from "@/frontend_lib/components/shared/CrudModal";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/frontend_lib/components/ui/dropdown-menu";

function makeRowActions(onAction: (op: CrudOperation, row: User) => void) {
  return function RowActions(row: User) {
    return (
      <>
        <DropdownMenuItem onClick={() => onAction("view", row)}>View</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("edit", row)}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onAction("delete", row)}
        >
          Delete
        </DropdownMenuItem>
      </>
    );
  };
}

// In the page component:
const modal = useCrudModal<User>();
const rowActions = React.useMemo(
  () => makeRowActions(modal.openModal),
  [modal.openModal]
);

<DataTable columns={columns} data={data} rowActions={rowActions} />
```

---

## Import — 3-step bulk flow

Enable with `enableImport` and `importTemplateColumns`. An **Import** button
appears in the toolbar and opens `DataTableImportModal`.

```tsx
<DataTable
  columns={columns}
  data={data}
  enableImport
  importTemplateColumns={["title", "department_name", "is_active"]}
  exportFileName="jobs"
  onImport={(rows) => console.log("Imported:", rows)}
/>
```

### Steps

**Step 1 — Upload**
- Download a pre-filled `.xlsx` template with the required column headers.
- Drag-and-drop or click to upload a `.xlsx`, `.xls`, or `.csv` file.
- Required columns are listed as a hint.

**Step 2 — Validate**
- Parses the uploaded file using `xlsx`.
- Checks that all `importTemplateColumns` are present as headers.
- Checks each row for empty required fields.
- Shows a valid/error count summary and a scrollable list of per-row errors.

**Step 3 — Confirm**
- Shows the count of valid records that will be imported.
- Warns about skipped error rows.
- Clicking **Import N records** calls `onImport(validRows)` and closes the modal.

---

## Export

The Export button downloads **selected rows** if any are selected, otherwise all
filtered rows. Three formats are supported:

| Format | Library |
|---|---|
| CSV | `papaparse` |
| Excel (.xlsx) | `xlsx` |
| JSON | Native `JSON.stringify` |

Export helpers are also available standalone:

```ts
import { exportToCSV, exportToXLSX, exportToJSON } from
  "@/frontend_lib/components/shared/data-table/utils";

exportToCSV(table.getFilteredRowModel().rows, "my-file");
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `@tanstack/react-table` | Core table engine |
| `papaparse` + `@types/papaparse` | CSV export and parsing |
| `xlsx` | Excel export and import parsing |
| `file-saver` + `@types/file-saver` | File download trigger |
