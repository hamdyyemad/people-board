"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/frontend_lib/components/ui/skeleton";
import { cn } from "@/frontend_lib/utils/utils";
import { useSkeleton } from "../hook/use-skeleton";
// --- TYPES ---

interface DataTableSkeletonProps<TData> {
  columns?: ColumnDef<TData>[];
  columnCount?: number;
  rowCount?: number;
  enableRowSelection?: boolean;
  enableRowActions?: boolean;
  className?: string;
}

// --- MAIN ORCHESTRATOR ---

export function DataTableSkeleton<TData>(props: DataTableSkeletonProps<TData>) {
  const { rowCount = 8, enableRowSelection = true, enableRowActions = true, className } = props;

  const colWidths = useSkeleton<TData>(props);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ToolbarSkeleton />

      <TableSkeleton 
        rowCount={rowCount} 
        colWidths={colWidths} 
        enableRowSelection={enableRowSelection} 
        enableRowActions={enableRowActions} 
      />

      <PaginationSkeleton />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ToolbarSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3">
      <Skeleton className="h-9 w-64 rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-8 rounded-md" />
        <Skeleton className="h-9 w-8 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

function TableSkeleton({ 
  rowCount, 
  colWidths, 
  enableRowSelection, 
  enableRowActions 
}: { 
  rowCount: number, 
  colWidths: (number | undefined)[],
  enableRowSelection: boolean,
  enableRowActions: boolean
}) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center gap-0 border-b bg-muted/30">
        <div className="flex w-full items-center">
          {colWidths.map((w, i) => (
            <div
              key={i}
              className="flex items-center px-3 py-3"
              style={{ width: w ?? undefined, flex: w ? "none" : 1 }}
            >
              <Skeleton className="h-4 w-full max-w-[120px] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Data Rows */}
      {Array.from({ length: rowCount }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex w-full items-center border-b last:border-0">
          {colWidths.map((w, colIdx) => (
            <div
              key={colIdx}
              className="flex items-center px-3 py-3"
              style={{ width: w ?? undefined, flex: w ? "none" : 1 }}
            >
              {/* Specialized Skeletons for Selection/Actions */}
              {colIdx === 0 && enableRowSelection ? (
                <Skeleton className="h-4 w-4 rounded-sm" />
              ) : colIdx === colWidths.length - 1 && enableRowActions ? (
                <Skeleton className="h-8 w-8 rounded-md" />
              ) : (
                <Skeleton
                  className="h-4 rounded"
                  style={{
                    width: `${55 + ((rowIdx * 7 + colIdx * 13) % 35)}%`, // Natural varying widths
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between px-1">
      <Skeleton className="h-4 w-32 rounded" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <Skeleton className="h-4 w-24 rounded" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}