import * as React from "react";
import { AddActionButton } from "./data-view-add-action-btn";

import { type EntityConfig } from "./data-view-type";

interface DataViewHeaderProps<T> {
  config: EntityConfig<T>;
}

function DataViewHeaderComponent<T extends object>({ config }: DataViewHeaderProps<T>) {
  return (
    <>
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{config.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {config.description}
        </p>
      </div>
      <AddActionButton config={config}/>
    </div>
    </>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export const DataViewHeader = React.memo(DataViewHeaderComponent) as typeof DataViewHeaderComponent;