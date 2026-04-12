import * as React from "react";
import {
  DataViewHeader,
  DataTable,
  type EntityConfig,
  type CardConfig,
  type DataTableFilterField,
  type CrudModalControls,
  type CrudOperation,
  type ServerPaginationProps,
} from "@/frontend_lib/components/shared/data-table";
import { CrudModalFactory } from "@/frontend_lib/components/shared/data-table/crud-modal";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/frontend_lib/components/ui/dropdown-menu";
import type { ColumnDef, Table } from "@tanstack/react-table";

interface DataViewLayoutProps<T> {
  children?: React.ReactNode;
  config: EntityConfig<T>;
  isLoading?: boolean;
  /** Pass React Query's `isFetching` here — shows a spinner overlay during page transitions. */
  isFetching?: boolean;
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
  // Modal props
  modal?: CrudModalControls<T>;
  modalLoading?: boolean;
  /**
   * When provided, cursor-based server pagination controls replace the
   * default client-side page navigator in the DataTable footer.
   */
  serverPagination?: ServerPaginationProps;
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
  isFetching = false,
  error = null,
  modal,
  modalLoading = false,
  serverPagination,
}: DataViewLayoutProps<T>) {
  
  // Generic click handlers for modal operations
  const handleRowClick = React.useCallback((row: T) => {
    if (modal) {
      modal.openModal("view", row);
    } else if (onRowClick) {
      onRowClick(row);
    }
  }, [modal?.openModal, onRowClick]);

  const handleRowAction = React.useCallback((operation: CrudOperation, row: T) => {
    modal?.openModal(operation, row);
  }, [modal?.openModal]);

  // Use provided rowActions or create generic ones if modal is provided
  const finalRowActions = React.useMemo(() => {
    if (rowActions) return rowActions;
    
    // If modal is provided, create generic row actions
    if (modal) {
      return (row: T) => (
        <>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowAction("view", row); }}>
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowAction("edit", row); }}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => { e.stopPropagation(); handleRowAction("delete", row); }}
          >
            Delete
          </DropdownMenuItem>
        </>
      );
    }
    
    return undefined;
  }, [rowActions, modal, handleRowAction]);
  
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DataViewHeader config={config} />
      
      {/* Optional children (e.g., stats, filters) */}
      {children}
      
      {/* DataTable integration */}
      <DataTable
        isLoading={isLoading}
        isFetching={isFetching}
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
        rowActions={finalRowActions}
        gridCard={gridCard}
        listCard={listCard}
        onRowClick={handleRowClick}
        onImport={onImport}
        filterFields={filterFields}
        serverPagination={serverPagination}
      />
      
      
      {/* CRUD Modal for row actions (edit/delete/view) */}
      {modal?.open && (
        <CrudModalFactory
          open={modal.open}
          operation={modal.operation}
          record={modal.record}
          entityName={config.name}
          formFields={config.formFields}
          getRecordLabel={config.getRecordLabel}
          onClose={modal.closeModal}
          loading={modalLoading}
          actions={{
            onAdd: config.onAdd,
            onEdit: config.onEdit,
            onDelete: config.onDelete,
          }}
        />
      )}
    </div>
  );
}

// Don't memoize layout - props will change
export default DataViewLayoutComponent as <T extends Object>(props: DataViewLayoutProps<T>) => React.ReactElement;