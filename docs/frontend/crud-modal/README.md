# CrudModal — Generic CRUD Modal System

A generic, factory-pattern modal system for View, Add, Edit, and Delete operations.
Built on Radix UI Dialog with a polished design: rounded corners, soft backdrop blur,
structured header with icon slot, and a shared footer with a left-action slot.

**Location:** `src/frontend_lib/components/shared/data-table/crud-modal/`

---

## File structure

```
CrudModal/
├── index.ts              ← Public exports
├── types.ts              ← Shared TypeScript types
├── useCrudModal.ts       ← State management hook
├── CrudModalFactory.tsx  ← Factory — selects body based on operation
├── ModalShell.tsx        ← Reusable Dialog wrapper (title, icon, size, header action)
├── ModalFooter.tsx       ← Shared action bar (left slot + Cancel / Confirm)
├── ViewModalBody.tsx     ← Read-only key/value grid with badge booleans
├── FormModalBody.tsx     ← Dynamic form for Add and Edit
└── DeleteModalBody.tsx   ← Destructive confirmation with styled warning block
```

---

## Design pattern: Factory

`CrudModalFactory` implements the **Factory Pattern**:

- The **caller** provides `operation` (`"view" | "add" | "edit" | "delete"`).
- The **factory** selects the correct body component at runtime.
- All variants share the same `ModalShell` wrapper.
- Adding a new operation only requires a new body component + one new `case` — no existing files change.

```
operation ──► CrudModalFactory ──► ModalShell
                                      ├── ViewModalBody    (view)
                                      ├── FormModalBody    (add / edit)
                                      └── DeleteModalBody  (delete)
```

---

## Quick start

```tsx
"use client";

import * as React from "react";
import { CrudModalFactory, useCrudModal } from
  "@/frontend_lib/components/shared/data-table/crud-modal";
import type { FormField } from "@/frontend_lib/components/shared/data-table/crud-modal";

interface Job {
  id: string;
  title: string;
  department_name: string;
  is_active: boolean;
}

const FORM_FIELDS: FormField[] = [
  { key: "title",           label: "Job Title",  type: "text",   required: true },
  { key: "department_name", label: "Department", type: "select", options: [...] },
];

export default function JobsPage() {
  const modal = useCrudModal<Job>();

  return (
    <>
      <Button onClick={() => modal.openModal("add")}>Add Job</Button>

      <CrudModalFactory<Job>
        open={modal.open}
        operation={modal.operation}
        record={modal.record}
        entityName="Job"
        formFields={FORM_FIELDS}
        getRecordLabel={(job) => job.title}
        onClose={modal.closeModal}
        actions={{
          onAdd:    (data)   => console.log("create", data),
          onEdit:   (data)   => console.log("update", data),
          onDelete: (record) => console.log("delete", record),
        }}
      />
    </>
  );
}
```

---

## `useCrudModal` hook

Manages the three pieces of state needed by the factory.

| Property | Type | Description |
|---|---|---|
| `open` | `boolean` | Whether the modal is currently open |
| `operation` | `CrudOperation \| null` | Active operation |
| `record` | `TData \| null` | The row being acted on (`null` for Add) |
| `openModal(op, record?)` | function | Opens the modal |
| `closeModal()` | function | Closes and resets state after the animation finishes |

```ts
const modal = useCrudModal<Job>();

modal.openModal("view",   row);  // View details (read-only)
modal.openModal("edit",   row);  // Pre-fill form with row data
modal.openModal("add");          // Blank form
modal.openModal("delete", row);  // Confirmation dialog
modal.closeModal();              // Close
```

The hook delays clearing `operation` and `record` by 300 ms after close so the
exit animation completes before the content disappears.

---

## `CrudModalFactory` props

| Prop | Type | Required | Description |
|---|---|---|---|
| `open` | `boolean` | ✓ | Controls dialog visibility |
| `operation` | `CrudOperation \| null` | ✓ | Determines which body to render |
| `record` | `TData \| null` | ✓ | Pre-fills Edit form; shown in View; used in Delete |
| `entityName` | `string` | ✓ | Used in titles: "Add Job", "Delete Department", etc. |
| `formFields` | `FormField[]` | ✓ | Field config for Add and Edit forms |
| `getRecordLabel` | `(r: TData) => string` | — | Label shown in Delete confirmation |
| `onClose` | `() => void` | ✓ | Called when modal should close |
| `loading` | `boolean` | — | Shows spinner on confirm button |
| `actions.onAdd` | `(data: Partial<TData>) => void` | — | Called after Add form is submitted |
| `actions.onEdit` | `(data: TData) => void` | — | Called after Edit form is submitted |
| `actions.onDelete` | `(record: TData) => void` | — | Called after Delete is confirmed |

---

## `ModalShell` — the dialog wrapper

`ModalShell` is the base layer shared by all modal variants. It can also be used
directly for any custom modal that doesn't fit the CRUD pattern.

```tsx
import { ModalShell } from "@/frontend_lib/components/shared/data-table/crud-modal";
import { Settings } from "lucide-react";

<ModalShell
  open={open}
  onOpenChange={setOpen}
  title="Appearance settings"
  description="Change how the interface looks."
  size="lg"
  icon={<Settings className="h-5 w-5" />}
  headerAction={<Badge>Pro</Badge>}
>
  {/* your content */}
</ModalShell>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | required | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | required | Called on close |
| `title` | `string` | required | Dialog title |
| `description` | `string` | — | Subtitle shown below the title |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Max width of the dialog |
| `icon` | `ReactNode` | — | Icon shown in a rounded box left of the title |
| `headerAction` | `ReactNode` | — | Element shown in the top-right of the header (e.g. step indicator, badge) |
| `className` | `string` | — | Extra classes on the `DialogContent` |

### Sizes

| Value | Max width |
|---|---|
| `sm` | 384px |
| `md` | 512px (default) |
| `lg` | 672px — used automatically for View |
| `xl` | 896px |

### Layout

The shell renders two zones:
1. **Header** — icon + title/description + headerAction + close button, separated by a border.
2. **Body** — `px-6 py-5` padding, children rendered here.

---

## `ModalFooter` — the action bar

`ModalFooter` is the shared bottom bar. It has a **left slot** for secondary actions
(e.g. a "Delete user" button) and right-aligned Cancel + Confirm buttons.

```tsx
import { ModalFooter } from "@/frontend_lib/components/shared/data-table/crud-modal";
import { Button } from "@/frontend_lib/components/ui/button";
import { Trash2 } from "lucide-react";

<ModalFooter
  onClose={onClose}
  onConfirm={handleSave}
  confirmLabel="Save changes"
  loading={isSaving}
  leftAction={
    <Button variant="ghost" className="text-destructive gap-1.5">
      <Trash2 className="h-4 w-4" />
      Delete user
    </Button>
  }
/>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `onClose` | `() => void` | required | Called when Cancel / Close is clicked |
| `onConfirm` | `() => void` | — | Called when Confirm is clicked |
| `confirmLabel` | `string` | `"Confirm"` | Label for the confirm button |
| `cancelLabel` | `string` | `"Cancel"` | Label for the cancel button |
| `confirmVariant` | `ButtonVariant` | `"default"` | Variant of the confirm button |
| `loading` | `boolean` | `false` | Shows a spinner and disables both buttons |
| `confirmDisabled` | `boolean` | `false` | Disables only the confirm button |
| `readOnly` | `boolean` | `false` | Hides the confirm button; cancel becomes "Close" |
| `leftAction` | `ReactNode` | — | Element rendered on the left side of the footer |

---

## `FormField` config

Drives the Add and Edit forms dynamically — no hardcoded JSX needed.

```ts
interface FormField {
  key: string;       // Maps to a key on TData
  label: string;     // Displayed above the input
  type?: "text" | "number" | "email" | "date" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;  // Shows * and disables submit if empty
  readOnly?: boolean;  // Renders as disabled
  options?: { label: string; value: string }[];  // For type: "select"
}
```

Example:

```ts
const FIELDS: FormField[] = [
  { key: "name",   label: "Full Name",  type: "text",     required: true },
  { key: "email",  label: "Email",      type: "email",    required: true },
  { key: "role",   label: "Role",       type: "select",
    options: [
      { label: "Admin", value: "admin" },
      { label: "User",  value: "user" },
    ],
  },
  { key: "notes",  label: "Notes",      type: "textarea" },
];
```

The form renders in a **2-column grid** on `sm` screens and above.
`textarea` fields span both columns automatically.

---

## Body components

### `ViewModalBody`

Renders a read-only key/value grid. Automatically:
- Skips `id`, `deleted_at`, `department_id`, `parent_id` fields.
- Formats `*_at` / `*_date` strings as human-readable dates.
- Renders booleans as coloured badge pills (green = Yes, muted = No).
- Uses uppercase tracking labels for field names.

### `DeleteModalBody`

Renders a styled warning block with a destructive border/background, the record
label, and a red **Delete** confirm button.

### `FormModalBody`

Driven entirely by the `fields` config. Supports `text`, `number`, `email`,
`date`, `select`, and `textarea` field types. Initialises from `record` when
editing, blank when adding. Disables the submit button until all required fields
are filled.

---

## Using body components directly

Each body component can be used standalone inside any `ModalShell`:

```tsx
import { ModalShell, DeleteModalBody } from
  "@/frontend_lib/components/shared/data-table/crud-modal";

<ModalShell open={open} onOpenChange={setOpen} title="Confirm deletion">
  <DeleteModalBody
    record={record}
    recordLabel={record.name}
    onClose={() => setOpen(false)}
    onConfirm={() => handleDelete(record)}
  />
</ModalShell>
```

---

## Extending with a new operation

To add a custom operation (e.g. `"archive"`):

1. Add `"archive"` to the `CrudOperation` union in `types.ts`.
2. Create `ArchiveModalBody.tsx` implementing `ModalBodyProps<TData>`.
3. Add a `case "archive"` block in `CrudModalFactory.tsx`.
4. Export from `index.ts`.

No other files need to change.
