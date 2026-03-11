import * as React from "react";

/**
 * Hook to manage import modal state
 * Used by DataTableToolbar and DataTableImportModal
 */
export function useDataTableImport() {
  const [isOpen, setIsOpen] = React.useState(false);

  const openImport = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeImport = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    setIsOpen,
    openImport,
    closeImport,
  };
}
