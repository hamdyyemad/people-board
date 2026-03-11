"use client";

import { ModalShell } from "../shared/modal-shell";
import { ViewModalBody } from "../products/view-modal-body";
import { FormModalBody, FormField } from "../products/form-modal-body";
import { DeleteModalBody } from "../products/delete-modal-body";
import { CrudOperation, CrudModalActions, ModalBodyProps } from "../types";

interface CrudModalFactoryProps<TData extends object> {
  open: boolean;
  operation: CrudOperation | null;
  record: TData | null;
  /** Human-readable entity name, e.g. "Job" or "Department" */
  entityName: string;
  /** Field config used by Add and Edit forms */
  formFields: FormField[];
  /** Derive a display label from a record, used in Delete confirmation */
  getRecordLabel?: (record: TData) => string;
  onClose: () => void;
  loading?: boolean;
  actions: CrudModalActions<TData>;
}

/**
 * CrudModalFactory — Factory Pattern implementation.
 *
 * Receives `operation` and selects the correct modal body at runtime:
 *   "view"   → ViewModalBody   (read-only key/value grid)
 *   "add"    → FormModalBody   (blank form)
 *   "edit"   → FormModalBody   (pre-filled form)
 *   "delete" → DeleteModalBody (confirmation with warning)
 *
 * All variants share the same ModalShell wrapper.
 * Add new operations by adding a new case — no existing code changes needed.
 */
export function CrudModalFactory<TData extends object>({
  open,
  operation,
  record,
  entityName,
  formFields,
  getRecordLabel,
  onClose,
  loading = false,
  actions,
}: CrudModalFactoryProps<TData>) {
  if (!operation) return null;

  const modalConfig = getModalConfig(operation, entityName);

  function handleConfirm(data?: Partial<TData>) {
    if (operation === "add") actions.onAdd?.(data ?? {});
    else if (operation === "edit" && record) actions.onEdit?.({ ...record, ...data });
    else if (operation === "delete" && record) actions.onDelete?.(record);
    onClose();
  }

  const sharedBodyProps = { record, onClose, onConfirm: handleConfirm };

  return (
    <ModalShell
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}
      title={modalConfig.title}
      description={modalConfig.description}
      size={operation === "view" ? "lg" : "md"}
    >
      {operation === "view" && (
        <ViewModalBody<TData & Record<string, unknown>>
          {...(sharedBodyProps as ModalBodyProps<TData & Record<string, unknown>>)}
        />
      )}

      {(operation === "add" || operation === "edit") && (
        <FormModalBody<TData & Record<string, unknown>>
          {...(sharedBodyProps as ModalBodyProps<TData & Record<string, unknown>>)}
          fields={formFields}
          operation={operation}
          loading={loading}
        />
      )}

      {operation === "delete" && (
        <DeleteModalBody<TData>
          {...sharedBodyProps}
          recordLabel={record ? getRecordLabel?.(record) : undefined}
          loading={loading}
        />
      )}
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface ModalConfig {
  title: string;
  description?: string;
}

function getModalConfig(operation: CrudOperation, entityName: string): ModalConfig {
  switch (operation) {
    case "view":
      return {
        title: `${entityName} Details`,
        description: `Full information for this ${entityName.toLowerCase()}.`,
      };
    case "add":
      return {
        title: `Add ${entityName}`,
        description: `Fill in the details to create a new ${entityName.toLowerCase()}.`,
      };
    case "edit":
      return {
        title: `Edit ${entityName}`,
        description: `Update the details for this ${entityName.toLowerCase()}.`,
      };
    case "delete":
      return {
        title: `Delete ${entityName}`,
      };
  }
}
