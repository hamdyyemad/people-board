import * as React from "react";
import { ColumnDef, Table } from "@tanstack/react-table";
import { Checkbox } from "@/frontend_lib/components/ui/checkbox";
import { DataTableRowActions } from "../row/data-table-row-actions";
import { columnFilterFn } from "../utils";

interface UseDataTableColumnsProps<TData> {
  userColumns: ColumnDef<TData>[];
  enableRowSelection?: boolean;
  rowActions?: (data: TData, table: Table<TData>) => React.ReactNode;
}

// Not memoized — table and row are mutable TanStack objects whose references
// never change even when selection state updates. Memoizing against a stable
// reference means the comparator always sees "no change" and skips the re-render,
// leaving checkboxes visually stale. Let the parent's re-render propagate.
function SelectAllCheckbox({ table }: { table: Table<any> }) {
  const isAllSelected = table.getIsAllPageRowsSelected();
  const isSomeSelected = table.getIsSomePageRowsSelected();

  return (
    <Checkbox
      checked={isAllSelected || (isSomeSelected && "indeterminate")}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
      className="translate-y-[2px]"
    />
  );
}

function RowSelectCheckbox({ row }: { row: any }) {
  const isSelected = row.getIsSelected();

  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
      className="translate-y-[2px]"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

export function useDataTableColumns<TData>({
  userColumns,
  enableRowSelection = true,
  rowActions,
}: UseDataTableColumnsProps<TData>) {
  const columns: ColumnDef<TData>[] = React.useMemo(() => {
    const cols: ColumnDef<TData>[] = [];

    // Add Selection Column
    if (enableRowSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => <SelectAllCheckbox table={table} />,
        cell: ({ row }) => <RowSelectCheckbox row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 40,
      });
    }

    // Add User Columns with Filter Function
    const columnsWithFilter = userColumns.map((col) => ({
      ...col,
      filterFn: (col as any).filterFn ?? columnFilterFn,
    }));
    cols.push(...columnsWithFilter);

    // Add Actions Column
    if (rowActions) {
      cols.push({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row, table }) => (
          <DataTableRowActions row={row} table={table} actions={rowActions} />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      });
    }

    return cols;
  }, [userColumns, enableRowSelection, rowActions]);

  return columns;
}
