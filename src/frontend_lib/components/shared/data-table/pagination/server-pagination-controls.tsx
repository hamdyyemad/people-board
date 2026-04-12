"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/frontend_lib/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend_lib/components/ui/select";
import type { ServerPaginationProps } from "../types";

interface ServerPaginationControlsProps {
  serverPagination: ServerPaginationProps;
  /** Row count in the current page (shown in the info label). */
  currentCount: number;
  currentLimit: number;
}

/**
 * Cursor-based pagination controls.
 *
 * Renders a Prev / Next pair driven by `IPaginationMeta` rather than page numbers.
 * "Prev" is disabled when there is no `prevCursor`; "Next" is disabled when
 * `hasMore` is false.
 */
export function ServerPaginationControls({
  serverPagination,
  currentCount,
  currentLimit,
}: ServerPaginationControlsProps) {
  const { meta, onNext, onPrev, onLimitChange, currentPage } = serverPagination;

  const totalPages =
    meta.totalCount != null && currentLimit > 0
      ? Math.ceil(meta.totalCount / currentLimit)
      : undefined;

  return (
    <div className="flex items-center gap-4">
      {/* Page Size Selector */}
      {onLimitChange && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Show per page
          </p>
          <Select
            value={`${currentLimit}`}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue placeholder={currentLimit} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Row count + page info */}
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {currentPage != null && totalPages != null ? (
          <>
            Page {currentPage} of {totalPages}
            {meta.totalCount != null && (
              <span className="ml-1">({meta.totalCount} total)</span>
            )}
          </>
        ) : (
          <>{currentCount} row(s)</>
        )}
      </div>

      {/* Cursor navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={onPrev}
          disabled={!meta.prevCursor}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={onNext}
          disabled={!meta.nextCursor}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
