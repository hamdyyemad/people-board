import { ColumnDef, Table } from "@tanstack/react-table";
import type { IPaginationMeta } from "@/frontend_lib/types";

export type ViewMode = "table" | "list" | "grid";

export type ExportFormat = "csv" | "xlsx" | "json";

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableFilterField<TData> {
  label: string;
  value: keyof TData | string;
  placeholder?: string;
  options?: DataTableFilterOption[];
}

// Card Configuration Types
export interface CardBadgeConfig<TData> {
  getValue: (row: TData) => string | boolean;
  getVariant?: (row: TData) => "default" | "secondary" | "success" | "destructive" | "outline" | "muted";
  format?: (value: any) => string;
}

export interface CardFieldConfig<TData> {
  label?: string;
  getValue: (row: TData) => any;
  format?: (value: any) => string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CardConfig<TData> {
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  title: (row: TData) => string;
  subtitle?: (row: TData) => string;
  badges?: CardBadgeConfig<TData>[];
  fields?: CardFieldConfig<TData>[];
}

/**
 * Passed from the page to the DataTable when using server-side cursor pagination.
 * The table will render cursor-aware Prev/Next controls instead of the default
 * client-side page navigator.
 */
export interface ServerPaginationProps {
  meta: IPaginationMeta;
  onNext: () => void;
  onPrev: () => void;
  /** Called when the user changes the "rows per page" selector. */
  onLimitChange?: (limit: number) => void;
  /** 1-indexed current page number. When provided alongside meta.totalCount, shows "Page X of Y". */
  currentPage?: number;
}

export interface DataTableConfig<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  error: Error | null;
  filterFields?: DataTableFilterField<TData>[];
  searchableColumns?: (keyof TData | string)[];
  defaultPageSize?: number;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  enableViewToggle?: boolean;
  enableGroupBy?: boolean;
  exportFileName?: string;
  /** Template columns for import validation */
  importTemplateColumns?: string[];
  /** Loading state — shows column-matched skeleton (first fetch only). */
  isLoading?: boolean;
  /**
   * Set to `true` while React Query is re-fetching (e.g. navigating pages).
   * Shows a subtle overlay instead of replacing the table with a skeleton,
   * so the user keeps seeing the previous page's data while the next loads.
   */
  isFetching?: boolean;
  // Card rendering: either pass custom render functions OR card configs
  gridCard?: ((row: TData) => React.ReactNode) | CardConfig<TData>;
  listCard?: ((row: TData) => React.ReactNode) | CardConfig<TData>;
  rowActions?: (row: TData, table: Table<TData>) => React.ReactNode;
  onRowClick?: (row: TData) => void;
  onImport?: (rows: TData[]) => void;
  /**
   * When provided, the table switches to server-side cursor pagination.
   * Client-side row chunking is disabled; Prev/Next cursors drive data fetching.
   */
  serverPagination?: ServerPaginationProps;
}
