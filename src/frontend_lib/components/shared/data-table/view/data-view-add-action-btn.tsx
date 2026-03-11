import * as React from "react";
import { lazy, Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/frontend_lib/components/ui/button";
import { useCrudModal } from "@/frontend_lib/components/shared/data-table/crud-modal";

import { type EntityConfig } from "./data-view-type";

const DataViewAction = lazy(() => import('./data-view-action')) as React.LazyExoticComponent<React.ComponentType<any>>;

function AddActionButtonComponent<T extends object>({ config }: { config: EntityConfig<T> }) {
  const modal = useCrudModal<T>();

  return (
    <>
      <Button className="gap-2" onClick={() => modal.openModal("add")}>
        <Plus className="h-4 w-4" />
        Add {config.name}
      </Button>

      {/* Performance Win: The modal only mounts when 'open' is true.
         Bundle Win: The JS only downloads when the button is clicked.
      */}
      {modal.open && (
        <Suspense fallback={null}>
          <DataViewAction modal={modal} config={config}/>
        </Suspense>
      )}
    </>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates  
export const AddActionButton = React.memo(AddActionButtonComponent) as typeof AddActionButtonComponent;