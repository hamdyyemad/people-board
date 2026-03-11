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

// Memoize with custom comparison that checks actual row data
export const TableDisplay = React.memo(
  TableDisplayComponent,
  (prevProps, nextProps) => {
    // Compare non-table props
    if (
      prevProps.onRowClick !== nextProps.onRowClick ||
      prevProps.columnCount !== nextProps.columnCount
    ) {
      return false;
    }
    
    // Compare actual row and header data
    const prevRows = prevProps.table.getRowModel().rows;
    const nextRows = nextProps.table.getRowModel().rows;
    const prevHeaders = prevProps.table.getHeaderGroups();
    const nextHeaders = nextProps.table.getHeaderGroups();
    
    // Check row count
    if (prevRows.length !== nextRows.length) return false;
    
    // Check header count
    if (prevHeaders.length !== nextHeaders.length) return false;
    
    // Compare row IDs and selection state
    for (let i = 0; i < prevRows.length; i++) {
      if (
        prevRows[i].id !== nextRows[i].id ||
        prevRows[i].getIsSelected() !== nextRows[i].getIsSelected()
      ) {
        return false;
      }
    }
    
    // Compare header visibility (columns might be hidden/shown)
    for (let i = 0; i < prevHeaders.length; i++) {
      const prevHeaderCells = prevHeaders[i].headers;
      const nextHeaderCells = nextHeaders[i].headers;
      
      if (prevHeaderCells.length !== nextHeaderCells.length) return false;
      
      for (let j = 0; j < prevHeaderCells.length; j++) {
        if (prevHeaderCells[j].id !== nextHeaderCells[j].id) return false;
      }
    }
    
    // No changes detected, skip re-render
    return true;
  }
) as typeof TableDisplayComponent;
