import * as React from "react";
import { Table } from "@tanstack/react-table";
import { exportToCSV, exportToXLSX, exportToJSON } from "../utils";

interface useDataTableExportProps<TData> {
  table: Table<TData>;
  exportFileName?: string;
}

/**
 * Hook for toolbar-specific logic
 * Handles export functionality for selected or filtered rows
 */
export function useDataTableExport<TData>({
  table,
  exportFileName = "export",
}: useDataTableExportProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  const handleExport = React.useCallback(
    (format: "csv" | "xlsx" | "json") => {
      const rows =
        selectedCount > 0
          ? table.getFilteredSelectedRowModel().rows
          : table.getFilteredRowModel().rows;

      const exporters = {
        csv: exportToCSV,
        xlsx: exportToXLSX,
        json: exportToJSON,
      };

      exporters[format](rows, exportFileName);
    },
    [table, selectedCount, exportFileName]
  );

  return {
    selectedCount,
    totalCount,
    handleExport,
  };
}
