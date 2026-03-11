"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/frontend_lib/components/ui/dialog";
import { cn } from "@/frontend_lib/utils/utils";

interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional icon shown in the header area */
  icon?: React.ReactNode;
  /** Optional element shown in the top-right of the header (e.g. step indicator) */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const sizeMap: Record<NonNullable<ModalShellProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * ModalShell — the reusable dialog wrapper.
 * Handles open state, sizing, title, description, and optional icon/header action.
 */
export function ModalShell({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  icon,
  headerAction,
  children,
  className,
}: ModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeMap[size], "p-0 overflow-hidden", className)}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-border/60">
          <div className="flex items-start gap-3 min-w-0">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                {icon}
              </div>
            )}
            <DialogHeader className="min-w-0">
              <DialogTitle className="pr-8">{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          </div>
          {headerAction && (
            <div className="shrink-0 pr-8">{headerAction}</div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
