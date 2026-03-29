# Global Error Handling

## Complete Error Flow Diagram

```
User action (form submit, button click)
               ↓
┌─────────────────────────────────────────┐
│  Component calls API function           │
│  (e.g., createDepartment(formData))     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  LAYER 1: Client Validation (in api.ts)│
│  - validateOrThrow() checks payload     │
│  - Throws ValidationError if invalid    │
└──────────────┬──────────────────────────┘
               │
               ↓ Validation passed
┌─────────────────────────────────────────┐
│  fetch() call to backend                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  LAYER 2: Response Check (handleResponse)│
│  - Checks res.ok                        │
│  - Throws ApiError if HTTP error        │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │  Success?   │
        └──────┬──────┘
               │
     ┌─────────┴─────────┐
     │ YES               │ NO (Error thrown)
     ↓                   ↓
   Return data    ┌─────────────────────────────────────────┐
   Success!       │  useGenericMutation catches error       │
                  │  Calls notifyError() or                 │
                  │  notifyValidationError()                │
                  └──────────────┬──────────────────────────┘
                                 ↓
                  ┌─────────────────────────────────────────┐
                  │  Global Handler Callback Triggered      │
                  │  (set in ErrorProvider's useEffect)     │
                  └──────────────┬──────────────────────────┘
                                 ↓
                  ┌─────────────────────────────────────────┐
                  │  Toast Shown to User (via Sonner)      │
                  └─────────────────────────────────────────┘
```

**Key Points:**
- **Two automatic validation layers** provide defense in depth
- **Layer 1** (client validation) = Prevents invalid requests, immediate feedback
- **Layer 2** (response check) = Catches server errors, business logic errors
- Errors don't automatically show toasts - need `notifyError()` call
- `useGenericMutation` calls notification functions automatically
- This separation provides flexibility and testability

This document describes the centralized error handling system implemented through the `ErrorProvider` component.

## Overview

The `ErrorProvider` is a generic, centralized error handling provider that manages all error types across the application:

- **API errors** - HTTP/RFC 7807 errors from backend APIs
- **Validation errors** - Form and data validation errors
- **Future error types** - Extensible for new error categories

## Architecture

### Error Provider Layer

```
App Layout (layout.tsx)
  └─ ErrorProvider ← Sets up global error handlers for all error types
      └─ ApiProvider ← Provides React Query client
          └─ LocaleProvider
              └─ ThemeProvider
                  └─ Your App
```

**Key Design Principles:**
- **Separation of Concerns** - Error handling is separate from API/data fetching
- **Single Responsibility** - ErrorProvider only handles errors, nothing else
- **Extensible** - Easy to add new error types (e.g., network errors, auth errors)
- **React lifecycle integration** - Handlers set in useEffect for proper SSR compatibility and lifecycle management

### File Structure

```
src/
├── frontend_lib/
│   ├── components/
│   │   └── providers/
│   │       ├── error-provider.tsx    ← Generic error provider (handles all error types)
│   │       ├── api-provider.tsx      ← React Query provider (no error handling)
│   │       └── index.ts              ← Re-exports all providers
│   └── errors/
│       ├── api-errors.ts             ← API error classes & handlers
│       ├── validation-errors.ts      ← Validation error classes & handlers
│       └── index.ts                  ← Re-exports all error utilities
└── app/
    └── layout.tsx                    ← Wraps app with ErrorProvider
```

## ErrorProvider Component

### Location
`src/frontend_lib/components/providers/error-provider.tsx`

### Purpose
Centralizes all error handling configuration in one place, making it easy to:
- Update error display logic globally
- Add new error types
- Switch notification libraries (e.g., replace Sonner with another toast library)
- Configure error logging services (e.g., Sentry, LogRocket)

### Implementation

```typescript
"use client";

import { ReactNode, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { setGlobalErrorHandler, ApiError } from "@/frontend_lib/errors/api-errors";
import { setGlobalValidationErrorHandler, ValidationError } from "@/frontend_lib/errors/validation-errors";

export function ErrorProvider({ children }: { children: ReactNode }) {
  
  useEffect(() => {
    // 1. Setup API Error Handler
    setGlobalErrorHandler((error: ApiError) => {
      const detail = error.details.detail || error.message;
      const title = error.details.title;
      
      toast.error(detail || title, {
        description: detail ? title : undefined,
        duration: 5000,
      });
    });

    // 2. Setup Validation Error Handler
    setGlobalValidationErrorHandler((error: ValidationError) => {  
      const fields = error.fieldErrors.map(f => f.field).join(", ");
      const firstError = error.fieldErrors[0]?.message || error.message;
      
      toast.error(firstError, {
        description: error.fieldErrors.length > 1 
          ? `Issues with: ${fields}`
          : undefined,
        duration: 5000,
      });
    });
  }, []);
  
  return (
    <>
      <Toaster position="bottom-right" richColors />
      {children}
    </>
  );
}
```

## Error Types Handled

### 1. API Errors (RFC 7807)

**Triggered by:** Failed HTTP requests (4xx, 5xx status codes)

**Example:**
```typescript
// In mutations.ts
export const useCreateUser = () => {
  return useGenericMutation({
    mutationFn: createUser,
    invalidateKeys: [['users']],
    // Error automatically handled by ErrorProvider
  });
};
```

**Toast Display:**
```
[ × ] Department name must be unique
      Conflict
```

**Error Flow:**
1. API returns RFC 7807 error response
2. `handleResponse()` parses it and throws `ApiError`
3. `useGenericMutation` catches it and calls `triggerError()`
4. `triggerError()` triggers global handler set by `ErrorProvider`
5. Toast is shown to user

### 2. Validation Errors

**Triggered by:** Form validation failures

**Example:**
```typescript
// In form component
try {
  await createUser(formData);
} catch (error) {
  if (error instanceof ValidationError) {
    // Automatically handled by ErrorProvider
    triggerValidationError(error);
  }
}
```

**Toast Display:**
```
[ × ] Email is required
      Issues with: email, password
```

**Error Flow:**
1. Validation fails (client or server)
2. `ValidationError` is created
3. `triggerValidationError()` is called
4. Global validation handler (set by `ErrorProvider`) is triggered
5. Toast shows first error with list of affected fields

## Usage in Layout

### layout.tsx

```typescript
import { ErrorProvider, ApiProvider, LocaleProvider, ThemeProvider } from "@/frontend_lib/components/providers";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorProvider>           {/* ← Outermost provider, handles all errors */}
          <ApiProvider>           {/* ← React Query provider */}
            <LocaleProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </LocaleProvider>
          </ApiProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
```

**Provider Order Matters:**
1. **ErrorProvider** - Must be outermost to catch errors from all child providers
2. **ApiProvider** - Provides React Query, may trigger API errors
3. **LocaleProvider/ThemeProvider** - App-specific providers

## Extending Error Handling

### Adding New Error Types

To add a new error type (e.g., network errors, auth errors):

1. **Create error class** in `errors/` folder:

```typescript
// errors/network-errors.ts
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

let networkErrorCallback: ((error: NetworkError) => void) | null = null;

export function setGlobalNetworkErrorHandler(callback: (error: NetworkError) => void) {
  networkErrorCallback = callback;
}

export function notifyNetworkError(error: NetworkError) {
  if (networkErrorCallback) {
    networkErrorCallback(error);
  }
}
```

2. **Add handler in ErrorProvider**:

```typescript
import { setGlobalNetworkErrorHandler, NetworkError } from "@/frontend_lib/errors/network-errors";

export function ErrorProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // ... existing handlers ...
    
    // 3. Setup Network Error Handler
    setGlobalNetworkErrorHandler((error: NetworkError) => {
      toast.error("Network connection lost", {
        description: error.message,
        duration: 5000,
      });
    });
  }, []);
  
  return (
    <>
      <Toaster position="bottom-right" richColors />
      {children}
    </>
  );
}
```

3. **Use in your code**:

```typescript
import { notifyNetworkError, NetworkError } from "@/frontend_lib/errors/network-errors";

if (!navigator.onLine) {
  notifyNetworkError(new NetworkError("No internet connection"));
}
```

### Customizing Toast Behavior

All toast configuration is in one place (`ErrorProvider`):

```typescript
// Change toast position
<Toaster position="top-center" />

// Change toast duration
toast.error(detail, {
  duration: 10000, // 10 seconds
});

// Add custom styling
toast.error(detail, {
  className: "custom-error-toast",
  style: { background: "red" },
});

// Add action buttons
toast.error(detail, {
  action: {
    label: "Retry",
    onClick: () => retryOperation(),
  },
});
```

### Adding Error Logging Services

Add error logging (Sentry, LogRocket, etc.) in ErrorProvider:

```typescript
import * as Sentry from "@sentry/nextjs";

export function ErrorProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    setGlobalErrorHandler((error: ApiError) => {
      // Log to Sentry
      Sentry.captureException(error, {
        tags: { type: "api_error" },
        extra: { details: error.details },
      });
      
      // Show toast to user
      toast.error(error.details.detail || error.message);
    });
    
    // ... other handlers ...
  }, []);
  
  return <><Toaster />{children}</>;
}
```

## Benefits of Centralized Error Handling

### ✅ Single Source of Truth
- All error handling logic in one file
- Easy to find and update
- Consistent behavior across the app

### ✅ Separation of Concerns
- API logic doesn't know about UI (toasts)
- Error display logic is separate from error creation
- Easy to test each layer independently

### ✅ Easy to Extend
- Add new error types without touching existing code
- Switch toast libraries by changing only ErrorProvider
- Add logging services in one place

### ✅ DRY (Don't Repeat Yourself)
- No need to repeat error handling in every component
- Generic hooks handle errors automatically
- Consistent error messages across the app

### ✅ Maintainability
- Update error messages globally
- Change toast position/style in one place
- Easy to add features like error retry, error reporting, etc.

## Comparison: Before vs After

### Before (Error Handling Scattered)

```typescript
// api-provider.tsx - API errors handled here
setGlobalErrorHandler((error) => toast.error(error.message));

// some-form.tsx - Validation errors handled here
catch (error) {
  if (error instanceof ValidationError) {
    toast.error(error.message);
  }
}

// another-component.tsx - Network errors handled here
catch (error) {
  toast.error("Network error");
}
```

**Problems:**
- ❌ Error handling scattered across many files
- ❌ Inconsistent error display
- ❌ Hard to update globally
- ❌ Difficult to add logging

### After (Centralized Error Handling)

```typescript
// error-provider.tsx - ALL errors handled here (in useEffect)
useEffect(() => {
  setGlobalErrorHandler((error: ApiError) => toast.error(error.message));
  setGlobalValidationErrorHandler((error: ValidationError) => toast.error(error.message));
  setGlobalNetworkErrorHandler((error: NetworkError) => toast.error(error.message));
}, []);

// components - just trigger errors
triggerError(error);           // Anywhere in the app
triggerValidationError(error); // Anywhere in the app
notifyNetworkError(error);    // Anywhere in the app
```

**Benefits:**
- ✅ All error handling in one file
- ✅ Consistent error display
- ✅ Easy to update globally
- ✅ Easy to add logging, analytics, etc.

## Best Practices

### ✅ DO:
- Keep all error handler setup in `ErrorProvider` using `useEffect`
- Use `triggerError()` / `triggerValidationError()` to trigger handlers
- Add new error types by extending the system (new error classes + handlers)
- Log errors to console for debugging
- Add error tracking services (Sentry) in `ErrorProvider`
- Set handlers in `useEffect` for proper React lifecycle and SSR compatibility

### ❌ DON'T:
- Don't set error handlers in multiple places
- Don't use `toast.error()` directly in components (use `triggerError()` instead)
- Don't mix error handling with business logic
- Don't forget to add handlers for new error types
- Don't set handlers at module-level (use `useEffect` instead for SSR safety)

## Related Documentation

- [API Configuration & Error Handling](../api-config/README.md) - Generic hooks and API error handling details
- [Error Modules](../../../src/frontend_lib/errors/) - Error classes and utilities
- [ErrorProvider Source](../../../src/frontend_lib/components/providers/error-provider.tsx) - Implementation
- [RFC 7807 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [Sonner Toast Documentation](https://sonner.emilkowal.ski/)

## Troubleshooting

### Errors not showing toasts

**Symptoms:** Errors are logged to console but no toast appears

**Solutions:**
1. Check that `ErrorProvider` is wrapping your app in `layout.tsx`
2. Check that `ErrorProvider` is the outermost provider
3. Verify `<Toaster />` is rendered
4. Verify handlers are set in `useEffect` within `ErrorProvider`
5. Check that `ErrorProvider` component has mounted

### Multiple toasts for same error

**Symptoms:** Same error shows multiple toasts

**Solutions:**
1. Don't call `triggerError()` and `toast.error()` together
2. Use `useGenericMutation` instead of manual error handling
3. Remove duplicate error handlers

### Wrong error message displayed

**Symptoms:** Toast shows generic message instead of specific error

**Solutions:**
1. Check that API returns RFC 7807 format
2. Verify `handleResponse()` is used in API functions
3. Check error parsing logic in `api-errors.ts`

### Handler not called

**Symptoms:** `triggerError()` called but handler doesn't execute

**Solutions:**
1. Verify handlers are set in `useEffect` within `ErrorProvider`
2. Check that `ErrorProvider` has mounted before errors are triggered
3. Ensure `ErrorProvider` wraps your entire app in `layout.tsx`
