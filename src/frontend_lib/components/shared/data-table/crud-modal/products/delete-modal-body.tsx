"use client";

import { TriangleAlert } from "lucide-react";
import { ModalFooter } from "../shared/modal-footer";
import { ModalBodyProps } from "../types";

interface DeleteModalBodyProps<TData> extends ModalBodyProps<TData> {
  recordLabel?: string;
  loading?: boolean;
}

/**
 * DeleteModalBody — confirmation dialog for destructive actions.
 */
export function DeleteModalBody<TData>({
  recordLabel,
  onClose,
  onConfirm,
  loading = false,
}: DeleteModalBodyProps<TData>) {
  return (
    <div className="flex flex-col gap-6">
      {/* Warning block */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-foreground font-medium">
          This action <span className="text-destructive font-semibold">cannot be undone</span>.
        </p>
        {recordLabel && (
          <p className="mt-1 text-sm text-muted-foreground">
            You are about to permanently delete{" "}
            <span className="font-semibold text-foreground">&ldquo;{recordLabel}&rdquo;</span>.
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Are you sure you want to continue?
        </p>
      </div>

      <ModalFooter
        onClose={onClose}
        onConfirm={() => onConfirm()}
        confirmLabel="Delete"
        confirmVariant="destructive"
        loading={loading}
      />
    </div>
  );
}
