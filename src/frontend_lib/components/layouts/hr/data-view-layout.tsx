import * as React from "react";
import { 
  DataViewHeader, 
  DataTable,
  type EntityConfig,
  type CardConfig,
  type DataTableFilterField,
} from "@/frontend_lib/components/shared/data-table";
import type { ColumnDef, Table } from "@tanstack/react-table";

interface DataViewLayoutProps<T> {
  children?: React.ReactNode;
  config: EntityConfig<T>;
  isLoading?: boolean;
  error?: Error | null;
  // DataTable props
  data: T[];
  columns: ColumnDef<T>[];
  rowActions?: (row: T, table: Table<T>) => React.ReactNode;
  gridCard?: ((row: T) => React.ReactNode) | CardConfig<T>;
  listCard?: ((row: T) => React.ReactNode) | CardConfig<T>;
  filterFields?: DataTableFilterField<T>[];
  onRowClick?: (row: T) => void;
  onImport?: (rows: T[]) => void;
  importTemplateColumns?: string[];
  exportFileName?: string;
  defaultPageSize?: number;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  enableViewToggle?: boolean;
}

function DataViewLayoutComponent<T extends Object>({ 
  children, 
  config,
  data,
  columns,
  rowActions,
  gridCard,
  listCard,
  filterFields,
  onRowClick,
  onImport,
  importTemplateColumns,
  exportFileName,
  defaultPageSize = 20,
  enableRowSelection = false,
  enableColumnVisibility = false,
  enableExport = false,
  enableImport = false,
  enableViewToggle = false,
  isLoading = false,
  error = null,
}: DataViewLayoutProps<T>) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DataViewHeader config={config} />
      
      {/* Optional children (e.g., stats, filters) */}
      {children}
      
      {/* DataTable integration */}
      <DataTable
        isLoading={isLoading}
        error={error}
        columns={columns}
        data={data}
        defaultPageSize={defaultPageSize}
        enableRowSelection={enableRowSelection}
        enableColumnVisibility={enableColumnVisibility}
        enableExport={enableExport}
        enableImport={enableImport}
        enableViewToggle={enableViewToggle}
        exportFileName={exportFileName}
        importTemplateColumns={importTemplateColumns}
        rowActions={rowActions}
        gridCard={gridCard}
        listCard={listCard}
        onRowClick={onRowClick}
        onImport={onImport}
        filterFields={filterFields}
      />
    </div>
  );
}

// Don't memoize layout - props will change
export default DataViewLayoutComponent as <T extends Object>(props: DataViewLayoutProps<T>) => React.ReactElement;