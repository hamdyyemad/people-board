"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/frontend_lib/components/ui/button";
import { useDataTableImport } from "../hook";

const DataTableImportModal = React.lazy(() => import("./data-table-import-modal")) as React.LazyExoticComponent<React.ComponentType<any>>;


interface ToolbarImportProps<TData> {
  /** Display name for the entity being imported */
  entityName: string;
  /** Column keys that must be present in the uploaded file */
  templateColumns: string[];
  /** Called with the validated rows when user confirms import */
  onImport: (rows: TData[]) => void;
}

/**
 * ToolbarImport - Self-contained import button with modal
 * 
 * Manages its own state using useDataTableImport hook.
 * Renders both the trigger button and the import modal.
 */
export function ToolbarImport<TData>({
  entityName,
  templateColumns,
  onImport,
}: ToolbarImportProps<TData>) {
  const { isOpen, openImport, closeImport } = useDataTableImport();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5"
        onClick={openImport}
      >
        <Upload className="h-4 w-4" />
        <span className="hidden lg:inline">Import</span>
      </Button>
      {
        isOpen && (
          <React.Suspense fallback={null}>
            <DataTableImportModal
              open={isOpen}
              onOpenChange={closeImport}
              entityName={entityName}
              templateColumns={templateColumns}
              onImport={onImport}
            />
          </React.Suspense>
        )
      }
    </>
  );
}
