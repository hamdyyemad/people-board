"use client";

import { Button } from "@/frontend_lib/components/ui/button";
import { DialogFooter } from "@/frontend_lib/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ModalFooterProps {
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  loading?: boolean;
  confirmDisabled?: boolean;
  /** When true, only the close button is shown (e.g. View modal) */
  readOnly?: boolean;
  /** Optional left-side element (e.g. Delete user button, step back) */
  leftAction?: React.ReactNode;
  className?: string;
}

/**
 * ModalFooter — shared action bar for all modal variants.
 * Supports loading state, destructive confirm, read-only mode, and a left-side action slot.
 */
export function ModalFooter({
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  loading = false,
  confirmDisabled = false,
  readOnly = false,
  leftAction,
  className,
}: ModalFooterProps) {
  return (
    <div className={`flex items-center justify-between gap-3 pt-2 ${className ?? ""}`}>
      {/* Left slot */}
      <div>{leftAction ?? <span />}</div>

      {/* Right actions */}
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {readOnly ? "Close" : cancelLabel}
        </Button>
        {!readOnly && onConfirm && (
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
            className="min-w-[110px]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}
