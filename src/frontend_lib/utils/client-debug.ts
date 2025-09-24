// Client-side debug utility that overrides console methods
// to automatically check DEBUG environment variable

interface DebugWindow extends Window {
  debug?: {
    enable: () => void;
    disable: () => void;
    toggle: () => void;
    isEnabled: () => boolean;
  };
}

const isClientDebugEnabled = (): boolean => {
  // Check localStorage first (for runtime control)
  if (typeof window !== 'undefined' && window.localStorage) {
    const localStorageDebug = window.localStorage.getItem('DEBUG');
    if (localStorageDebug !== null) {
      return localStorageDebug === 'true';
    }
  }
  
  // Check for environment variable (set during build)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEXT_PUBLIC_DEBUG === 'true';
  }
  
  // Default to false for production safety
  return false;
};

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

// Override console methods to check debug status
console.log = (...args: unknown[]): void => {
  if (isClientDebugEnabled()) {
    originalConsole.log('🔍', ...args);
  }
};

console.error = (...args: unknown[]): void => {
  if (isClientDebugEnabled()) {
    originalConsole.error('❌', ...args);
  }
};

console.warn = (...args: unknown[]): void => {
  if (isClientDebugEnabled()) {
    originalConsole.warn('⚠️', ...args);
  }
};

console.info = (...args: unknown[]): void => {
  if (isClientDebugEnabled()) {
    originalConsole.info('ℹ️', ...args);
  }
};

console.debug = (...args: unknown[]): void => {
  if (isClientDebugEnabled()) {
    originalConsole.debug('🐛', ...args);
  }
};

// Utility functions to control debug from browser console
export const enableClientDebug = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('DEBUG', 'true');
    originalConsole.log('🔍 Client debug enabled');
  }
};

export const disableClientDebug = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('DEBUG', 'false');
    originalConsole.log('🔍 Client debug disabled');
  }
};

export const toggleClientDebug = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const current = window.localStorage.getItem('DEBUG');
    const newValue = current === 'true' ? 'false' : 'true';
    window.localStorage.setItem('DEBUG', newValue);
    originalConsole.log(`🔍 Client debug ${newValue === 'true' ? 'enabled' : 'disabled'}`);
  }
};

// Make debug control available globally for easy access
if (typeof window !== 'undefined') {
  (window as DebugWindow).debug = {
    enable: enableClientDebug,
    disable: disableClientDebug,
    toggle: toggleClientDebug,
    isEnabled: isClientDebugEnabled
  };
}

// Export the original console methods for cases where you need them
export const originalConsoleMethods = originalConsole; 