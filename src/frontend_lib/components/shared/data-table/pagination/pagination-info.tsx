import { Table } from "@tanstack/react-table";

interface PaginationInfoProps<TData> {
  table: Table<TData>;
  /** When server pagination is active, pass `meta.count` here instead of using the table row model. */
  serverTotalCount?: number;
}

export function PaginationInfo<TData>({ table, serverTotalCount }: PaginationInfoProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = serverTotalCount ?? table.getFilteredRowModel().rows.length;

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