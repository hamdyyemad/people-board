import * as React from "react";
import { Row } from "@tanstack/react-table";
import { cn } from "@/frontend_lib/utils/utils";
import type { CardConfig } from "../types";
import { GenericGridCard } from "./generic-cards";

interface GridDisplayProps<TData> {
  rows: Row<TData>[];
  renderItem?: ((data: TData) => React.ReactNode) | CardConfig<TData>;
  onRowClick?: (data: TData) => void;
}

export function GridDisplay<TData>({
  rows,
  renderItem,
  onRowClick,
}: GridDisplayProps<TData>) {
  if (!rows.length) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground rounded-lg border">
        No results found.
      </div>
    );
  }

  // Check if renderItem is a config object or function
  const isConfig = renderItem && typeof renderItem !== "function";
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map((row) => (
        <div
          key={row.id}
          className={cn(onRowClick && "cursor-pointer")}
          onClick={() => onRowClick?.(row.original)}
        >
          {isConfig ? (
            <GenericGridCard row={row.original} config={renderItem as CardConfig<TData>} />
          ) : (
            (renderItem as ((data: TData) => React.ReactNode))?.(row.original)
          )}
        </div>
      ))}
    </div>
  );
}
