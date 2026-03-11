"use client";

import * as React from "react";
import { DataTableSkeleton } from "./loaders";
import { DataTableToolbar } from "./toolbar";
import { DataTableDisplayFactory } from "./displays";
import { DataTablePagination } from "./pagination";

import { useDataTable, useDataTableColumns } from "./hook";

import { DataTableConfig } from "./types";

/**
 * DataTable Component - Main Orchestrator
 *
 * A flexible, feature-rich data table with multiple view modes (table, list, grid),
 * filtering, sorting, pagination, and export/import capabilities.
 *
 * Architecture:
 * - Core table logic managed by useDataTable hook (shared state)
 * - View mode managed directly in DataTableDisplayFactory
 * - Child components use their own hooks for component-specific logic
 * - Import functionality is self-contained in ToolbarImport component
 */
function DataTableComponent<TData>({
  columns: userColumns,
  data,
  filterFields,
  defaultPageSize = 20,
  enableRowSelection = true,
  enableColumnVisibility = true,
  enableExport = true,
  enableImport = false,
  enableViewToggle = true,
  exportFileName = "export",
  importTemplateColumns,
  isLoading = false,
  gridCard,
  listCard,
  rowActions,
  onRowClick,
  onImport,
}: DataTableConfig<TData>) {
  // Build columns with selection and actions
  const columns = useDataTableColumns({
    userColumns,
    enableRowSelection,
    rowActions,
  });

  // Core table instance with shared state (sorting, filtering, pagination, selection)
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data,
    columns,
    enableRowSelection,
    defaultPageSize,
  });

  // Memoize callbacks to prevent unnecessary re-renders
  const handleGlobalFilterChange = React.useCallback(
    (value: string) => {
      setGlobalFilter(value);
    },
    [setGlobalFilter]
  );

  // Show skeleton while loading
  if (isLoading) {
    return (
      <DataTableSkeleton
        columns={userColumns}
        rowCount={8}
        enableRowSelection={enableRowSelection}
        enableRowActions={!!rowActions}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar row: search/actions on right, space on left for positioned toggles */}
      <div className="flex items-center justify-end gap-4">
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
          enableColumnVisibility={enableColumnVisibility}
          enableExport={enableExport}
          enableImport={enableImport}
          enableViewToggle={enableViewToggle}
          filterFields={filterFields}
          exportFileName={exportFileName}
          importTemplateColumns={importTemplateColumns}
          onImport={onImport}
        />
      </div>

      {/* Display with toggles positioned absolutely to align with toolbar */}
      <DataTableDisplayFactory
        table={table}
        columnCount={columns.length}
        onRowClick={onRowClick}
        listCard={listCard}
        gridCard={gridCard}
        hasListView={!!listCard}
        hasGridView={!!gridCard}
        enableViewToggle={enableViewToggle}
      />
      

      <DataTablePagination table={table} />
    </div>
  );
}

// Memoize the entire DataTable to prevent re-renders from parent
export const DataTable = React.memo(
  DataTableComponent,
  (prevProps, nextProps) => {
    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      const changes = [];
      if (prevProps.data !== nextProps.data) changes.push('data');
      if (prevProps.columns !== nextProps.columns) changes.push('columns');
      if (prevProps.rowActions !== nextProps.rowActions) changes.push('rowActions');
      if (prevProps.onRowClick !== nextProps.onRowClick) changes.push('onRowClick');
      if (prevProps.gridCard !== nextProps.gridCard) changes.push('gridCard');
      if (prevProps.listCard !== nextProps.listCard) changes.push('listCard');
      if (prevProps.onImport !== nextProps.onImport) changes.push('onImport');
      if (prevProps.filterFields !== nextProps.filterFields) changes.push('filterFields');
      if (changes.length > 0) {
        console.log('[DataTable] Props changed:', changes);
      }
    }
    
    // Compare data reference (should be stable from parent)
    if (prevProps.data !== nextProps.data) return false;
    
    // Compare columns reference
    if (prevProps.columns !== nextProps.columns) return false;
    
    // Compare scalar props
    if (
      prevProps.isLoading !== nextProps.isLoading ||
      prevProps.defaultPageSize !== nextProps.defaultPageSize ||
      prevProps.enableRowSelection !== nextProps.enableRowSelection ||
      prevProps.enableColumnVisibility !== nextProps.enableColumnVisibility ||
      prevProps.enableExport !== nextProps.enableExport ||
      prevProps.enableImport !== nextProps.enableImport ||
      prevProps.enableViewToggle !== nextProps.enableViewToggle ||
      prevProps.exportFileName !== nextProps.exportFileName
    ) {
      return false;
    }
    
    // Compare callback functions (should be stable from parent memoization)
    if (
      prevProps.rowActions !== nextProps.rowActions ||
      prevProps.gridCard !== nextProps.gridCard ||
      prevProps.listCard !== nextProps.listCard ||
      prevProps.onRowClick !== nextProps.onRowClick ||
      prevProps.onImport !== nextProps.onImport
    ) {
      return false;
    }
    
    // Compare arrays by reference (should be memoized from parent)
    if (
      prevProps.filterFields !== nextProps.filterFields ||
      prevProps.importTemplateColumns !== nextProps.importTemplateColumns
    ) {
      return false;
    }
    
    // All checks passed - skip re-render
    return true;
  }
) as typeof DataTableComponent;