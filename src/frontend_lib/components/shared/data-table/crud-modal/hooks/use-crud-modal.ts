"use client";

import * as React from "react";
import { CrudOperation, CrudModalState } from "../types";

export interface CrudModalControls<TData> extends CrudModalState<TData> {
  /** Open the modal for a given operation, optionally with a pre-loaded record */
  openModal: (operation: CrudOperation, record?: TData) => void;
  /** Close the modal and reset state after the animation finishes */
  closeModal: () => void;
}

/**
 * useCrudModal — convenience hook for managing modal open/operation/record state.
 *
 * Usage:
 *   const modal = useCrudModal<Job>();
 *   modal.openModal("edit", row)   // opens the edit modal with the row pre-loaded
 *   modal.openModal("add")         // opens the add modal with no record
 *   modal.closeModal()             // closes and resets state
 */
export function useCrudModal<TData>(): CrudModalControls<TData> {
  const [state, setState] = React.useState<CrudModalState<TData>>({
    open: false,
    operation: null,
    record: null,
  });

  const openModal = React.useCallback((operation: CrudOperation, record?: TData) => {
    setState({ open: true, operation, record: record ?? null });
  }, []);

  const closeModal = React.useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    // Delay clearing operation/record so the close animation can finish
    setTimeout(() => {
      setState({ open: false, operation: null, record: null });
    }, 300);
  }, []);

  // Memoize the return object so it's only recreated when state actually changes
  return React.useMemo(
    () => ({ ...state, openModal, closeModal }),
    [state.open, state.operation, state.record, openModal, closeModal]
  );
}
