import * as React from "react";
import { ViewMode } from "../types";

// Shared state store outside of React components
let sharedViewMode: ViewMode = "table";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return sharedViewMode;
}

function setSharedViewMode(mode: ViewMode) {
  sharedViewMode = mode;
  listeners.forEach((listener) => listener());
}

/**
 * Hook to manage view mode state (table, list, grid)
 * Uses a shared state store so all instances stay synchronized
 * Automatically validates and corrects view mode based on available views
 */
export function useDataTableViewMode(
  defaultMode: ViewMode = "table",
  hasListView: boolean = true,
  hasGridView: boolean = true
) {
  // Use React's useSyncExternalStore for safe external state subscription
  const viewMode = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot // Use same snapshot for server-side rendering
  );

  // Validate and correct view mode if current selection is not available
  React.useEffect(() => {
    if (viewMode === "list" && !hasListView) {
      setSharedViewMode("table");
    } else if (viewMode === "grid" && !hasGridView) {
      setSharedViewMode("table");
    }
  }, [viewMode, hasListView, hasGridView]);

  const setViewMode = React.useCallback((mode: ViewMode) => {
    setSharedViewMode(mode);
  }, []);

  return {
    viewMode,
    setViewMode,
  };
}
