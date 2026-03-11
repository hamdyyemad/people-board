import { Table } from "@tanstack/react-table";

export function PaginationInfo<TData>({ table }: { table: Table<TData> }) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="text-sm text-muted-foreground">
      {selectedRows > 0 ? (
        <span>
          {selectedRows} of {totalRows} row(s) selected
        </span>
      ) : (
        <span>{totalRows} total row(s)</span>
      )}
    </div>
  );
}