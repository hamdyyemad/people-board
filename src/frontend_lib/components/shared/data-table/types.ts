import { ColumnDef, Table } from "@tanstack/react-table";

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

export interface DataTableConfig<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
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
  /** Loading state — shows column-matched skeleton */
  isLoading?: boolean;
  // Card rendering: either pass custom render functions OR card configs
  gridCard?: ((row: TData) => React.ReactNode) | CardConfig<TData>;
  listCard?: ((row: TData) => React.ReactNode) | CardConfig<TData>;
  rowActions?: (row: TData, table: Table<TData>) => React.ReactNode;
  onRowClick?: (row: TData) => void;
  onImport?: (rows: TData[]) => void;
}
