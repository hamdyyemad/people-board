import * as React from "react";
import { Table as TanstackTable } from "@tanstack/react-table";
import { LayoutGrid, LayoutList, List } from "lucide-react";
import { useDataTableViewMode } from "../hook";
import { TableDisplay } from "./table-display";
import { ListDisplay } from "./list-display";
import { GridDisplay } from "./grid-display";
import { cn } from "@/frontend_lib/utils/utils";
import type { CardConfig } from "../types";

interface DataTableDisplayFactoryProps<TData> {
  table: TanstackTable<TData>;
  columnCount: number;
  onRowClick?: (data: TData) => void;
  listCard?: ((data: TData) => React.ReactNode) | CardConfig<TData>;
  gridCard?: ((data: TData) => React.ReactNode) | CardConfig<TData>;
  hasListView?: boolean;
  hasGridView?: boolean;
  enableViewToggle?: boolean;
}

/**
 * DataTableDisplayFactory - Renders the appropriate display component based on view mode
 *
 * Manages view mode state and renders both toggle buttons (positioned absolutely to align with toolbar)
 * and the corresponding display content (table, list, or grid).
*/

const viewOptions = [
  {
    mode: "table" as const,
    icon: LayoutList,
    label: "Table",
    title: "Table view",
  },
  {
    mode: "list" as const,
    icon: List,
    label: "List",
    title: "List view",
  },
  {
    mode: "grid" as const,
    icon: LayoutGrid,
    label: "Grid",
    title: "Grid view",
  },
];

// Memoized view toggle buttons to prevent re-renders
interface ViewToggleButtonsProps {
  viewMode: "table" | "list" | "grid";
  setViewMode: (mode: "table" | "list" | "grid") => void;
  availableViewOptions: typeof viewOptions;
}

const ViewToggleButtons = React.memo<ViewToggleButtonsProps>(
  ({ viewMode, setViewMode, availableViewOptions }) => {
    return (
      <div className="absolute -top-[52px] left-0 z-10">
        <div className="flex items-center rounded-lg border border-input bg-background p-0.5 gap-0.5">
          {availableViewOptions.map(({ mode, icon: Icon, label, title }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                viewMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
              title={title}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  },
  (prev, next) => {
    // Only re-render if viewMode changes or available options change
    return (
      prev.viewMode === next.viewMode &&
      prev.availableViewOptions === next.availableViewOptions &&
      prev.setViewMode === next.setViewMode
    );
  }
);

ViewToggleButtons.displayName = "ViewToggleButtons";

function DataTableDisplayFactoryComponent<TData>({
  table,
  columnCount,
  onRowClick,
  listCard,
  gridCard,
  hasListView,
  hasGridView,
  enableViewToggle,
}: DataTableDisplayFactoryProps<TData>) {
  // Manage view mode state with automatic validation
  const { viewMode, setViewMode } = useDataTableViewMode(
    "table",
    hasListView,
    hasGridView
  );
  const rows = table.getRowModel().rows;

  // Filter available view options based on provided cards
  const availableViewOptions = React.useMemo(() => {
    return viewOptions.filter(({ mode }) => {
      if (mode === "table") return true;
      if (mode === "list") return hasListView;
      if (mode === "grid") return hasGridView;
      return false;
    });
  }, [hasListView, hasGridView]);

  return (
    <div className="relative">
      {/* View toggle buttons - positioned absolutely to align with toolbar row above */}
      {enableViewToggle && availableViewOptions.length > 1 && (
        <ViewToggleButtons
          viewMode={viewMode}
          setViewMode={setViewMode}
          availableViewOptions={availableViewOptions}
        />
      )}

      {/* Display content */}
      <div>
        {renderDisplay()}
      </div>
    </div>
  );

  function renderDisplay() {
    switch (viewMode) {
      case "table":
        return (
          <TableDisplay
            table={table}
            onRowClick={onRowClick}
            columnCount={columnCount}
          />
        );

      case "list":
        if (!listCard) {
          // Fallback to table if list card is not provided
          return (
            <TableDisplay
              table={table}
              onRowClick={onRowClick}
              columnCount={columnCount}
            />
          );
        }
        return (
          <ListDisplay
            rows={rows}
            renderItem={listCard}
            onRowClick={onRowClick}
          />
        );

      case "grid":
        if (!gridCard) {
          // Fallback to table if grid card is not provided
          return (
            <TableDisplay
              table={table}
              onRowClick={onRowClick}
              columnCount={columnCount}
            />
          );
        }
        return (
          <GridDisplay
            rows={rows}
            renderItem={gridCard}
            onRowClick={onRowClick}
          />
        );

      default:
        return (
          <TableDisplay
            table={table}
            onRowClick={onRowClick}
            columnCount={columnCount}
          />
        );
    }
  }
}

// Not memoized — the table prop is a mutable TanStack object whose reference
// never changes even when data updates. Any comparator reading getRowModel()
// would see the already-updated rows on both sides (prev and next), making it
// impossible to detect a page change. Let DataTable's memo gate re-renders;
// this component should always render fresh when its parent does.
export const DataTableDisplayFactory = DataTableDisplayFactoryComponent;
