export type CrudOperation = "view" | "add" | "edit" | "delete";

export interface CrudModalState<TData> {
  open: boolean;
  operation: CrudOperation | null;
  record: TData | null;
}

export interface CrudModalActions<TData> {
  onAdd?: (data: Partial<TData>) => void | Promise<void>;
  onEdit?: (data: TData) => void | Promise<void>;
  onDelete?: (record: TData) => void | Promise<void>;
  onClose?: () => void;
}

/**
 * Props passed into every operation-specific modal body.
 * The factory selects the right body component based on `operation`.
 */
export interface ModalBodyProps<TData> {
  record: TData | null;
  onClose: () => void;
  onConfirm: (data?: Partial<TData>) => void | Promise<void>;
}
