"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/frontend_lib/components/ui/dialog";
import { Button } from "@/frontend_lib/components/ui/button";
import { Input } from "@/frontend_lib/components/ui/input";
import { Label } from "@/frontend_lib/components/ui/label";

interface DataTableColumnFilterModalProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FilterMode = "contains" | "equals" | "startsWith" | "endsWith" | "isEmpty" | "isNotEmpty";

const FILTER_MODES: { value: FilterMode; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

/**
 * DataTableColumnFilterModal — per-column filter dialog.
 * Supports text matching modes: contains, equals, startsWith, endsWith, isEmpty, isNotEmpty.
 */
export function DataTableColumnFilterModal<TData, TValue>({
  column,
  title,
  open,
  onOpenChange,
}: DataTableColumnFilterModalProps<TData, TValue>) {
  const currentFilter = column.getFilterValue() as string | undefined;
  const [mode, setMode] = React.useState<FilterMode>("contains");
  const [value, setValue] = React.useState(currentFilter ?? "");

  // Sync when re-opened
  React.useEffect(() => {
    if (open) {
      setValue((column.getFilterValue() as string) ?? "");
    }
  }, [open, column]);

  const noValueNeeded = mode === "isEmpty" || mode === "isNotEmpty";

  function handleApply() {
    if (noValueNeeded) {
      column.setFilterValue(mode === "isEmpty" ? "__empty__" : "__notempty__");
    } else if (value.trim()) {
      column.setFilterValue(`${mode}:${value.trim()}`);
    } else {
      column.setFilterValue(undefined);
    }
    onOpenChange(false);
  }

  function handleClear() {
    column.setFilterValue(undefined);
    setValue("");
    setMode("contains");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-5 border-b border-border/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <DialogHeader>
            <DialogTitle>Filter: {title}</DialogTitle>
            <DialogDescription>
              Set a condition to filter this column.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Mode selector */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Condition
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {FILTER_MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    mode === m.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Value input */}
          {!noValueNeeded && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-value" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Value
              </Label>
              <Input
                id="filter-value"
                placeholder={`Filter by ${title.toLowerCase()}…`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                autoFocus
              />
            </div>
          )}

          {/* Current filter indicator */}
          {currentFilter && (
            <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
              Current filter: <span className="font-medium text-foreground">{currentFilter}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
            Clear filter
          </Button>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={!noValueNeeded && !value.trim()}>
              Apply
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
