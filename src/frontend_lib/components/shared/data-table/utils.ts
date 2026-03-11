import * as XLSX from "xlsx";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { FilterFn, Row } from "@tanstack/react-table";

function exportToCSV<TData>(rows: Row<TData>[], filename: string) {
  const data = rows.map((row) => row.original);
  const csv = Papa.unparse(data as object[]);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
}

function exportToXLSX<TData>(rows: Row<TData>[], filename: string) {
  const data = rows.map((row) => row.original);
  const worksheet = XLSX.utils.json_to_sheet(data as object[]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

function exportToJSON<TData>(rows: Row<TData>[], filename: string) {
  const data = rows.map((row) => row.original);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  saveAs(blob, `${filename}.json`);
}

/**
 * A sophisticated filter function for TanStack Table that supports advanced filtering modes.
 * * It handles standard string inclusion by default, but also supports:
 * - Special flags: `__empty__` and `__notempty__`
 * - Mode-based filtering using the format `mode:value` (e.g., "startsWith:Senior")
 * * @param row - The row to be filtered.
 * @param columnId - The ID of the column being filtered.
 * @param filterValue - The filter criteria string.
 * @returns {boolean} True if the row matches the filter criteria.
 */
const columnFilterFn: FilterFn<unknown> = (row, columnId, filterValue: string): boolean => {
  // Normalize cell value to lowercase string for case-insensitive comparison
  const cellValue = String(row.getValue(columnId) ?? "").toLowerCase();
  const normalizedFilter = filterValue.toLowerCase();

  // 1. Handle Special Constants
  if (filterValue === "__empty__") return cellValue === "";
  if (filterValue === "__notempty__") return cellValue !== "";

  // 2. Handle Mode-based Filtering (Format: "mode:value")
  if (filterValue.includes(":")) {
    const [mode, ...valueParts] = filterValue.split(":");
    const value = valueParts.join(":").toLowerCase();

    switch (mode) {
      case "contains":
        return cellValue.includes(value);
      case "equals":
        return cellValue === value;
      case "startsWith":
        return cellValue.startsWith(value);
      case "endsWith":
        return cellValue.endsWith(value);
      default:
        // Fallback if an unknown mode is passed
        return cellValue.includes(value);
    }
  }

  // 3. Default: Standard Case-Insensitive Inclusion
  return cellValue.includes(normalizedFilter);
};

/**
 * Optimization: Automatically removes the filter from the table state 
 * if the value is null, undefined, or an empty string.
 */
columnFilterFn.autoRemove = (val: unknown) => !val;

export { exportToCSV, exportToXLSX, exportToJSON, columnFilterFn };