// Debug initializer - import this to activate console override
// This file ensures the console methods are overridden when imported

import './client-debug';

// Export a function to check if debug is initialized
export const isDebugInitialized = (): boolean => {
  return typeof window !== 'undefined' && (window as any).debug !== undefined;
};

// Export debug control functions for easy access
export { enableClientDebug, disableClientDebug, toggleClientDebug } from './client-debug';
