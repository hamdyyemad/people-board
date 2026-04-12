import * as React from "react";
import { Table as TanstackTable, flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend_lib/components/ui/table";
import { cn } from "@/frontend_lib/utils/utils";

interface TableDisplayProps<TData> {
  table: TanstackTable<TData>;
  onRowClick?: (data: TData) => void;
  columnCount: number;
}

function TableDisplayComponent<TData>({
  table,
  onRowClick,
  columnCount,
}: TableDisplayProps<TData>) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent border-b bg-muted/30"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    width: header.getSize() !== 150 ? header.getSize() : undefined,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn("border-b last:border-0", onRowClick && "cursor-pointer")}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className="h-32 text-center text-muted-foreground"
              >
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Not memoized — same reason as DataTableDisplayFactory: the table prop is a
// mutable TanStack object. Row IDs are also index-based ("0", "1", "2"…) and
// stay identical across pages, making ID comparison useless for detecting
// page changes. DataTable's own memo already prevents unnecessary renders at
// the outer boundary.
export const TableDisplay = TableDisplayComponent;
