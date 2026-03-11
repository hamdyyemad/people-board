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

// Memoize with custom comparison that checks actual filter state
export const DataTableToolbar = React.memo(
  DataTableToolbarComponent,
  (prevProps, nextProps) => {
    // Compare scalar props
    if (
      prevProps.globalFilter !== nextProps.globalFilter ||
      prevProps.onGlobalFilterChange !== nextProps.onGlobalFilterChange ||
      prevProps.enableColumnVisibility !== nextProps.enableColumnVisibility ||
      prevProps.enableExport !== nextProps.enableExport ||
      prevProps.enableImport !== nextProps.enableImport ||
      prevProps.enableViewToggle !== nextProps.enableViewToggle ||
      prevProps.exportFileName !== nextProps.exportFileName ||
      prevProps.filterFields !== nextProps.filterFields ||
      prevProps.importTemplateColumns !== nextProps.importTemplateColumns ||
      prevProps.onImport !== nextProps.onImport
    ) {
      return false;
    }
    
    // Compare actual filter state from table
    const prevFilters = prevProps.table.getState().columnFilters;
    const nextFilters = nextProps.table.getState().columnFilters;
    
    if (prevFilters.length !== nextFilters.length) return false;
    
    // Compare filter content
    for (let i = 0; i < prevFilters.length; i++) {
      if (
        prevFilters[i].id !== nextFilters[i].id ||
        prevFilters[i].value !== nextFilters[i].value
      ) {
        return false;
      }
    }
    
    // Compare row selection state for selected count badge
    const prevSelection = prevProps.table.getState().rowSelection;
    const nextSelection = nextProps.table.getState().rowSelection;
    const prevSelectionCount = Object.keys(prevSelection).length;
    const nextSelectionCount = Object.keys(nextSelection).length;
    
    if (prevSelectionCount !== nextSelectionCount) return false;
    
    // No changes detected, skip re-render
    return true;
  }
) as typeof DataTableToolbarComponent;