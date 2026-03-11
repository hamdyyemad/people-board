# Radix Dropdown Layout Shift Fix

## Problem

When any Radix UI dropdown (or select, tooltip, etc.) opens, the entire page layout
shifts to the left by ~15px. This happens on pages that have a vertical scrollbar.

### Root cause

Radix `DropdownMenu` defaults to `modal={true}`. When a modal-mode dropdown opens,
Radix activates `@radix-ui/react-remove-scroll`, which:

1. Locks `<body>` scroll to prevent background scrolling.
2. Detects the scrollbar width (usually ~15px).
3. Injects `padding-right: 15px` on `<body>` to compensate for the scrollbar disappearing.

Because the app uses a fixed sidebar layout, that injected padding causes the visible
left-shift instead of preventing it.

```
body {
  padding-right: 15px;  ← Radix injects this on open → layout shifts left
}
```

---

## Fix

Set `modal={false}` as the **default** on the `DropdownMenu` root component.

**File:** `src/frontend_lib/components/ui/dropdown-menu.tsx`

```tsx
// Before
const DropdownMenu = DropdownMenuPrimitive.Root;

// After
const DropdownMenu = ({
  modal = false,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) => (
  <DropdownMenuPrimitive.Root modal={modal} {...props} />
);
DropdownMenu.displayName = "DropdownMenu";
```

### Why `modal={false}` is safe for dropdowns

Dropdowns do **not** semantically require scroll-locking. Scroll-locking is only
meaningful for true modal dialogs (where the user must interact before continuing).
Dropdowns are transient overlays — the user can and should be able to scroll while
one is open.

Setting `modal={false}` disables `react-remove-scroll` entirely for dropdowns, so:

- No `padding-right` is ever injected on `<body>`.
- No layout shift occurs.
- Dropdowns still render correctly in a Portal above all other content.

### Opt-in to modal behaviour

If a specific dropdown genuinely needs scroll-lock (rare), pass `modal={true}` explicitly:

```tsx
<DropdownMenu modal={true}>
  ...
</DropdownMenu>
```

---

## Affected components

This fix applies to all components that use `DropdownMenu` internally:

- `DataTableToolbar` (Columns, Export dropdowns)
- `DataTableColumnHeader` (Sort dropdown)
- `DataTableRowActions` (⋯ row menu)
- Any other `DropdownMenu` usage in the app

---

## What did NOT work

| Attempted fix | Why it failed |
|---|---|
| `scrollbar-gutter: stable` on `html` | Reserves scrollbar space but Radix still injects padding on top of it, causing a double shift |
| Overriding `body { padding-right: 0 !important }` | Fights Radix at runtime — fragile and causes flicker |
| Wrapping layout in `overflow: hidden` | Hides the scrollbar entirely — breaks page scroll |
