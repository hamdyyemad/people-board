"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { ToolbarSearch } from "./toolbar-search";
import { ToolbarExport } from "./toolbar-export";
import { ToolbarColumns } from "./toolbar-columns";
import { ToolbarImport } from "./toolbar-import";
import { DataTableFilterField } from "../types";
import { useDataTableExport } from "../hook";

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  enableViewToggle?: boolean;
  filterFields?: DataTableFilterField<TData>[];
  exportFileName?: string;
  // Import-related props (only needed when enableImport is true)
  importTemplateColumns?: string[];
  onImport?: (rows: TData[]) => void;
}

// --- MAIN ORCHESTRATOR ---

function DataTableToolbarComponent<TData>(props: DataTableToolbarProps<TData>) {
  const { table, globalFilter, onGlobalFilterChange, exportFileName } = props;

  // Use toolbar-specific hook for export logic and counts
  const { selectedCount, totalCount, handleExport } = useDataTableExport({
    table,
    exportFileName,
  });

  return (
    <div className="flex items-center justify-end gap-2">
      <ToolbarSearch
        value={globalFilter}
        onChange={onGlobalFilterChange}
        isFiltered={table.getState().columnFilters.length > 0 || globalFilter.length > 0}
        onReset={() => {
          table.resetColumnFilters();
          onGlobalFilterChange("");
        }}
      />
      
      {selectedCount > 0 && (
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary whitespace-nowrap">
          {selectedCount} of {totalCount} selected
        </span>
      )}

      {props.enableColumnVisibility && <ToolbarColumns table={table} />}

      {props.enableImport && props.importTemplateColumns && props.onImport && (
        <ToolbarImport
          entityName={exportFileName ?? "Record"}
          templateColumns={props.importTemplateColumns}
          onImport={props.onImport}
        />
      )}

      {props.enableExport && (
        <ToolbarExport onExport={handleExport} selectedCount={selectedCount} />
      )}
    </div>
  );
}

// Not memoized — table is a mutable TanStack object. Custom comparators that read
// table.getState() or table.getAllColumns() on prev/next props always see the same
// already-updated object, so they always return "no change" and block re-renders.
// This prevents the "X of Y selected" badge and column-visibility menu from updating.
export const DataTableToolbar = DataTableToolbarComponent;