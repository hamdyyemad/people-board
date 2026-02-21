# Sidebar Collapsed by Default

## Problem

The app sidebar was expanded by default on every page load. The desired behavior is for the sidebar to start **collapsed** (icon-only) by default.

## Cause

The sidebar open state is controlled by `SidebarProvider` from `@/frontend_lib/components/ui/sidebar`. Its default for the `defaultOpen` prop is `true`:

```tsx
const SidebarProvider = React.forwardRef<...>(
  (
    {
      defaultOpen = true,  // ← default
      ...
    },
    ...
  ) => {
    const [_open, _setOpen] = React.useState(defaultOpen);
    // ...
  }
);
```

So whenever the dashboard shell did not pass `defaultOpen`, the sidebar started expanded.

## Solution

Pass **`defaultOpen={false}`** into `SidebarProvider` where the dashboard layout is rendered, so the sidebar starts in the collapsed (icon-only) state.

## Implementation

**File:** `src/frontend_lib/components/layouts/dashboard-shell.tsx`

Update the `SidebarProvider` usage to set the initial open state to false:

```tsx
<SidebarProvider
  defaultOpen={false}
  style={{ "--sidebar-width": "350px" } as React.CSSProperties}
>
  ...
</SidebarProvider>
```

## Behavior After the Change

- **First load / no cookie:** Sidebar renders collapsed (icon-only).
- **User expands sidebar:** They can still use the sidebar trigger to expand; when they do, the component writes the new state to the `sidebar_state` cookie so future toggles work as before.
- **Cookie note:** The current implementation does **not** read the cookie on initial mount; the initial state is always `defaultOpen`. So every full page load (or new session) will start with the sidebar collapsed. If you later want “remember last state” (e.g. expanded if the user left it expanded), the sidebar would need to read `sidebar_state` on mount and use it to initialize `defaultOpen` or the controlled `open` prop.

## Summary

| Item        | Location                                              |
|------------|--------------------------------------------------------|
| Change     | Add `defaultOpen={false}` to `SidebarProvider`         |
| File       | `src/frontend_lib/components/layouts/dashboard-shell.tsx` |
| Prop source| `SidebarProvider` in `src/frontend_lib/components/ui/sidebar.tsx` |
