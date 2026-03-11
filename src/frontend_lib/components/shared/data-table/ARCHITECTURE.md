# DataTable Enhanced Architecture

## Overview
The DataTable component has been refactored into a modular, hook-based architecture where each component manages its own logic through dedicated hooks, reducing prop drilling and improving maintainability.

## Architecture Principles

### 1. **Separation of Concerns**
- Parent hook (`useDataTable`) contains **only shared state** used by multiple components
- Child components use **their own hooks** for component-specific logic
- **DataTableDisplayFactory** manages view mode with its own hook instance
- No unnecessary prop passing between parent and children

### 2. **Hook Hierarchy**

```
DataTable (Parent Component)
├── useDataTable (Core table state - shared)
│   ├── sorting, filtering, pagination
│   ├── row selection, global filter
│   └── TanStack Table instance
│
└── useDataTableColumns (Column building)
    ├── Selection checkbox column
    ├── User-defined columns
    └── Actions column

DataTableToolbar (Child Component)
└── useDataTableExport (Toolbar-specific logic)
    ├── Export handler
    ├── Selected count (computed)
    └── Total count (computed)
    
    └── ToolbarImport (Sub-component)
        └── useDataTableImport (Import modal state)
            └── open/close state

DataTableDisplayFactory (Child Component)
├── useDataTableViewMode() → manages viewMode, setViewMode
├── View Toggle Buttons (internal)
│   ├── Positioned absolutely to align with toolbar (right-4)
│   └── Self-managed click handlers
└── Renders appropriate display (Table/List/Grid)
```

## Hook Details

### `useDataTable` (Core Shared State)
**Location:** `hook/use-data-table.ts`
**Purpose:** Manages table state shared across all components
**Returns:**
- `table` - TanStack Table instance
- `globalFilter` - Global search filter
- `setGlobalFilter` - Update global filter

**Usage:** Parent DataTable component only

---

### `useDataTableColumns` (Column Configuration)
**Location:** `hook/use-data-table-columns.tsx`
**Purpose:** Builds column array with selection and actions
**Returns:** `ColumnDef<TData>[]`

**Usage:** Parent DataTable component only

---

### `useDataTableViewMode` (View Toggle)
**Location:** `hook/use-data-table-view-mode.ts`
**Purpose:** Manages view mode state (table/list/grid)
**Returns:**
- `viewMode` - Current view mode
- `setViewMode` - Update view mode

**Usage:** DataTableDisplayFactory component only (each instance has its own state)

---

### `useDataTableImport` (Import Modal)
**Location:** `hook/use-data-table-import.ts`
**Purpose:** Manages import modal open/close state
**Returns:**
- `isOpen` - Modal open state
- `setIsOpen` - Update modal state
- `openImport` - Helper to open modal
- `closeImport` - Helper to close modal

**Usage:** ToolbarImport component internally (not in parent)

---

### `useDataTableExport` (Toolbar Logic)
**Location:** `hook/use-data-table-toolbar.ts`
**Purpose:** Handles toolbar-specific logic (export, counts)
**Returns:**
- `selectedCount` - Number of selected rows
- `totalCount` - Total filtered rows
- `handleExport` - Export handler function

**Usage:** DataTableToolbar component internally

---

### `ToolbarImport` (Import Button + Modal Component)
**Location:** `toolbar/toolbar-import.tsx`
**Purpose:** Self-contained import feature with button and modal
**Props:**
- `entityName` - Display name for entity
- `templateColumns` - Required columns for import
- `onImport` - Callback with validated rows

**Internal Logic:**
- Uses `useDataTableImport` hook for modal state
- Renders both trigger button and modal
- No state management in parent

**Usage:** DataTableToolbar (when enableImport is true)

---

### `DataTableDisplayFactory` (Display Factory Component)
**Location:** `displays/data-table-display-factory.tsx`
**Purpose:** Factory pattern for rendering appropriate view based on mode AND contains view toggle buttons
**Props:**
- `table` - TanStack Table instance
- `columnCount` - Number of columns
- `onRowClick` - Click handler
- `listCard` - Renderer for list view
- `gridCard` - Renderer for grid view
- `hasListView` - Whether list view is available
- `hasGridView` - Whether grid view is available
- `enableViewToggle` - Whether to show view toggle buttons

**Hook Usage:** Uses `useDataTableViewMode()` directly (no context)

**Pattern:** 
- Renders view toggle buttons at the top (positioned absolutely with `right-4` to avoid overlap)
- Uses switch statement to select and render correct display component
- Self-contained view mode management

**Usage:** Parent DataTable component

## Design Patterns

### Context API Pattern (View Mode)

The view mode state uses React Context to eliminate prop drilling:

**Benefits:**
- No need to pass viewMode/setViewMode through parent
- Multiple child components can access the same state
- State management happens at the right level (children)
- Parent remains clean and focused

**Implementation:**
```tsx
// Provider wraps children
<ViewModeProvider defaultMode="table">
  <DataTableToolbar /> {/* Uses useViewModeContext() */}
  <DataTableDisplayFactory /> {/* Uses useViewModeContext() */}
</ViewModeProvider>

// Children access directly
const { viewMode, setViewMode } = useViewModeContext();
```

--- (Context API)
**Before:**
```tsx
// Parent manages and passes state
const [viewMode, setViewMode] = useState("table");

<DataTableToolbar
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  ...
/>

<DataTableDisplayFactory
  viewMode={viewMode}
  ...
/>
```

**After (Context):**
```tsx
// Parent just wraps with provider
<ViewModeProvider defaultMode="table">
  <DataTableToolbar /> {/* No viewMode props */}
  <DataTableDisplayFactory /> {/* No viewMode props */}
</ViewModeProvider>

// Children access directly via context
const { viewMode, setViewMode } = useViewModeContext();
### ✅ Reduced Prop Drilling
**Before:**
```tsx
{viewMode === "table" && (
  <TableDisplay table={table} onRowClick={onRowClick} columnCount={columns.length} />
)}
{viewMode === "list" && (
  <ListDisplay rows={rows} renderItem={listCard} onRowClick={onRowClick} />
)}
### ✅ Reduced Prop Drilling (Context API + Factory Pattern)

**Before (Multi-conditional rendering with prop drilling):**
```tsx
// Parent passes viewMode everywhere
### ✅ Reduced Prop Drilling (Direct Hook Usage + Factory Pattern)

**Before (Multi-conditional rendering with prop drilling):**
```tsx
// Parent passes viewMode everywhere
const [viewMode, setViewMode] = useState("table");

<DataTableToolbar
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  ...
/>

{viewMode === "table" && (
  <TableDisplay table={table} onRowClick={onRowClick} columnCount={columns.length} />
)}
{viewMode === "list" && (
  <ListDisplay rows={rows} renderItem={listCard} onRowClick={onRowClick} />
)}
{viewMode === "grid" && (
  <GridDisplay rows={rows} renderItem={gridCard} onRowClick={onRowClick} />
)}
```

**After (Direct Hook + Factory):**
```tsx
// Parent has no view mode logic
<DataTableToolbar /> {/* No viewMode props */}
<DataTableDisplayFactory /> {/* Manages view mode internally */}

// Inside DataTableDisplayFactory
const { viewMode, setViewMode } = useDataTableViewMode();
// Renders toggle buttons and display content
```

### ✅ Better Encapsulation
Each component manages its own state:
- `DataTableToolbar` computes its own counts and export logic via `useDataTableExport`
- `ToolbarImport` manages its own modal state via `useDataTableImport` (no prop drilling from parent)
- `DataTableDisplayFactory` manages view mode with its own `useDataTableViewMode` instance
  - Contains view toggle buttons (not in toolbar)
  - Renders display content based on active view mode
- No import state in parent when import is disabled
- View mode completely isolated in DisplayFactory

### ✅ Easier Testing
- Test hooks independently
- Mock only what each component needs
- Clear boundaries between concerns

### ✅ Scalability
Adding new features:
1. Create new hook for specific logic
2. Use in relevant component
3. No changes to parent or siblings

### ✅ Type Safety
Full TypeScript support maintained throughout all hooks and components

### ✅ Performance Optimization
**Natural Re-render Isolation:**
- When view mode changes, ONLY `DataTableDisplayFactory` re-renders
- View toggle buttons are inside DisplayFactory, so they re-render with it
- Toolbar components never re-render (no view mode dependency)
- Pagination never re-renders (no view mode dependency)
- Simple hook usage - no context overhead

**Architecture Benefits:**
- No need for React.memo
- No Context Provider/Consumer complexity
- Natural component boundaries prevent unnecessary re-renders
- View mode logic completely isolated in DisplayFactory
- Clicking view buttons only affects the display area

**CSS Positioning:**
- View toggle buttons positioned with `absolute -top-[52px] right-4`
- The `right-4` offset (16px) ensures no overlap with toolbar's Export/Import buttons
- Visually aligned with toolbar row while logically inside DisplayFactory

**Result:** Optimal performance with simple architecture - only the display factory re-renders when view mode changes.

## File Structure

```
DataTable/
├── data-table.tsx (Main orchestrator)
├── contexts/
│   ├── ViewModeContext.tsx (DEPRECATED - no longer used)
│   └── index.ts
├── hook/
│   ├── index.ts (Barrel exports)
│   ├── use-data-table.ts (Core shared state)
│   ├── use-data-table-columns.tsx (Column building)
│   ├── use-data-table-view-mode.ts (View mode state - used directly in DisplayFactory)
│   ├── use-data-table-import.ts (Import modal state)
│   └── use-data-table-toolbar.ts (Toolbar logic)
├── displays/
│   ├── table-display.tsx
│   ├── list-display.tsx
│   ├── grid-display.tsx
│   ├── data-table-display-factory.tsx (Uses useDataTableViewMode directly)
│   └── index.ts
└── toolbar/
    ├── data-table-toolbar.tsx (Uses useDataTableExport)
    ├── toolbar-import.tsx (Self-contained import with modal)
    └── ...other toolbar components
```
    ├── data-table-toolbar.tsx (Uses useDataTableExport internally)
    └── ...other toolbar components
```

## Migration Guide

### For Existing Consumers
No changes required! The public API remains the same:

```tsx
<DataTable
  columns={columns}
  data={data}
  enableExport
  enableImport
  // ...same props as before
/>
```

### For Future Development
When adding new features:

1. **Ask:** Is this state shared across multiple components?
   - **Yes** → Add to `useDataTable`
   - **No** → Create a new component-specific hook

2. **Example:** Adding bulk actions
   ```tsx
   // Create: hook/use-data-table-bulk-actions.ts
   export function useDataTableBulkActions(table) {
     const handleDelete = () => { /* ... */ }
     const handleDuplicate = () => { /* ... */ }
     return { handleDelete, handleDuplicate }
   }
   
   // Use in toolbar:
   const { handleDelete, handleDuplicate } = useDataTableBulkActions(table)
   ```

## Summary

The enhanced architecture follows React best practices:
- **Composition over inheritance**
- **Co-location of concerns**
- **Minimal prop drilling**
- **Single responsibility per hook**

Each piece of logic lives where it's used, making the codebase easier to understand, test, and extend.
