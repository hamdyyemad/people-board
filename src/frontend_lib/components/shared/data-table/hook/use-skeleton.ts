import React from "react";
import { ColumnDef } from "@tanstack/react-table";

interface DataTableSkeletonProps<TData> {
  columns?: ColumnDef<TData>[];
  columnCount?: number;
  rowCount?: number;
  enableRowSelection?: boolean;
  enableRowActions?: boolean;
  className?: string;
}

export function useSkeleton<TData>({
  columns,
  columnCount,
  enableRowSelection,
  enableRowActions,
}: DataTableSkeletonProps<TData>) {
  return React.useMemo(() => {
    const widths: (number | undefined)[] = [];

    if (enableRowSelection) widths.push(40);

    if (columns) {
      columns.forEach((col) => {
        widths.push((col as { size?: number }).size);
      });
    } else {
      for (let i = 0; i < (columnCount ?? 5); i++) widths.push(undefined);
    }

    if (enableRowActions) widths.push(50);

    return widths;
  }, [columns, columnCount, enableRowSelection, enableRowActions]);
}