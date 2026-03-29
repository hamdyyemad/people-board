# Frontend API Configuration & Error Handling

This document describes the API configuration, generic reusable hooks, and error handling integration for frontend operations.

> **Note:** For comprehensive error handling documentation, see [Global Error Handling](../global-error/README.md)

## Overview

The error handling system provides:
- **API error handling** - Unified parsing of HTTP API errors (RFC 7807)
- **Validation error handling** - Structured form and data validation errors
- **Global error notifications** using Sonner toast via `ErrorProvider`
- **Type-safe error handling** with dedicated error classes
- **Consistent error messages** across all operations
- **Generic reusable hooks** - `useGenericQuery` and `useGenericMutation` to eliminate boilerplate

## File Organization

```
src/frontend_lib/
├── components/
│   └── providers/
│       ├── error-provider.tsx ← Generic error provider (handles ALL error types)
│       ├── api-provider.tsx   ← React Query provider
│       └── index.ts           ← Re-exports all providers
├── errors/
│   ├── api-errors.ts          ← API/HTTP error handling (RFC 7807)
│   ├── validation-errors.ts   ← Form/data validation errors
│   └── index.ts               ← Re-exports all error utilities
├── validation/                 ← General validation utilities (NEW)
│   ├── zod.ts                 ← Validation helpers & common schemas
│   ├── index.ts               ← Main exports
│   └── README.md              ← Documentation
├── api/
│   ├── config.ts              ← React Query config + generic hooks (useGenericQuery, useGenericMutation)
│   └── department/
│       ├── api.ts             ← Fetch functions with handleResponse() + validation
│       ├── mutations.ts       ← useMutation hooks (using useGenericMutation)
│       ├── queries.ts         ← useQuery hooks (using useGenericQuery)
│       ├── validation.ts      ← Department-specific validation schemas
│       ├── types.ts           ← TypeScript types
│       └── index.ts           ← Public exports
```

**Key Architecture Points:**
- **ErrorProvider** wraps the entire app and handles all error types globally
- **ApiProvider** only manages React Query client (no error handling)
- **validation/** folder contains reusable validation utilities shared across all modules
- **api/*/validation.ts** files contain module-specific validation schemas
- Error handling is completely separated from API/data fetching concerns

### Import Paths

Multiple ways to import error utilities, validation, and hooks:

```typescript
// Option 1: Direct from specific modules (most explicit)
import { validateOrThrow, uuidOptional } from '@/frontend_lib/validation';
import { createDepartmentBodySchema } from '@/frontend_lib/api/department/validation';
import { handleResponse, ApiError, triggerError } from '@/frontend_lib/errors/api-errors';
import { ValidationError, parseValidationErrors } from '@/frontend_lib/errors/validation-errors';

// Option 2: From errors index (convenient for multiple imports)
import { ApiError, ValidationError, triggerError } from '@/frontend_lib/errors';

// Option 3: From config (recommended for API modules)
import { 
  handleResponse, 
  ApiError, 
  triggerError,
  useGenericQuery,    // ← Generic query hook
  useGenericMutation  // ← Generic mutation hook
} from '@/frontend_lib/api/config';
```

**Recommendation:** 
- Use **`api/config`** for API modules (queries/mutations) to import hooks and errors together
- Use **`errors/api-errors`** for standalone error handling
- Use **`errors/validation-errors`** for form validation
- Use **`errors/index`** when importing both error types

## Architecture

### 1. Core Files

#### `errors/api-errors.ts` - API Error Handling (HTTP/RFC 7807)

Contains all API/HTTP error-related functionality:

```typescript
// Types
export interface ProblemDetails { ... }

// Classes
export class ApiError extends Error { ... }

// Response Handler
export async function handleResponse<T>(response: Response): Promise<T>

// Global Error Notification
export function setGlobalErrorHandler(callback: (error: ApiError) => void)
export function triggerError(error: unknown)
```

**Responsibilities:**
- Parses RFC 7807 API error responses
- Throws `ApiError` for failed HTTP requests
- Manages global API error callback system
- Provides HTTP-specific debug logging

#### `errors/validation-errors.ts` - Validation Error Handling

Contains all validation error functionality:

```typescript
// Types
export interface FieldError { field: string; message: string; }
export interface ValidationErrors { [field: string]: string | string[]; }

// Classes
export class ValidationError extends Error { ... }

// Helpers
export function parseValidationErrors(responseData: any): ValidationError
export function setGlobalValidationErrorHandler(callback: (error: ValidationError) => void)
export function triggerValidationError(error: ValidationError)
```

**Responsibilities:**
- Handles form and data validation errors
- Provides field-level error tracking
- Supports multiple validation error formats
- Can be used for both client-side and server-side validation

#### `errors/index.ts` - Unified Exports

Re-exports all error utilities for convenience:

```typescript
export * from "./api-errors";
export * from "./validation-errors";
```

#### `api/config.ts` - Configuration & Re-exports

```typescript
// Re-exports from errors/api-errors
export {
  type ProblemDetails,
  ApiError,
  handleResponse,
  setGlobalErrorHandler,
  triggerError,
} from "../errors/api-errors";

// React Query configuration
export const queryClientConfig: DefaultOptions { ... }
```

**Responsibilities:**
- React Query default settings
- Convenient import point for API error utilities
- Keeps API imports clean and organized

#### Generic Reusable Hooks - `useGenericQuery` & `useGenericMutation`

The config module provides two powerful generic hooks that eliminate code duplication across all API modules:

**`useGenericQuery<TData>(queryKey, queryFn, options)`** - Smart query hook with automatic retry logic

```typescript
// Simple usage - fetch all items
export const useDepartments = () => {
  return useGenericQuery(['departments'], fetchDepartments);
};

// With options - conditional fetching
export const useDepartment = (id: string) => {
  return useGenericQuery(
    ['departments', id],
    () => fetchDepartmentById(id),
    { enabled: !!id }
  );
};
```

**Built-in Smart Retry Strategy:**
- ❌ **Never retries** client errors (400-499) - they won't fix themselves
- ✅ **Retries up to 2 times** for server errors (500+) and network errors
- Prevents unnecessary API calls for authorization/validation failures

**`useGenericMutation<TData, TVariables>(options)`** - Mutation hook with error handling and cache invalidation

```typescript
// Create operation - auto-invalidates related queries
export const useCreateDepartment = () => {
  return useGenericMutation({
    mutationFn: createDepartment,
    invalidateKeys: [['departments'], ['departments', 'stats']],
  });
};

// Update operation with custom success callback
export const useUpdateDepartment = () => {
  return useGenericMutation({
    mutationFn: ({ id, data }) => updateDepartment(id, data),
    invalidateKeys: [['departments'], ['departments', id]],
    onSuccess: (data) => console.log('Updated:', data),
  });
};

// Delete without error toast (custom handling)
export const useDeleteDepartment = () => {
  return useGenericMutation({
    mutationFn: deleteDepartment,
    invalidateKeys: [['departments']],
    showErrorToast: false,
    onError: (error) => {
      // Custom error handling logic
    },
  });
};
```

**Built-in Features:**
- ✅ Automatic error toast notifications (can be disabled)
- ✅ Automatic query invalidation on success
- ✅ Type-safe with generic parameters
- ✅ Custom success/error callbacks
- ✅ Handles both `ApiError` and unknown errors

**Benefits:**
- **Reduces boilerplate by ~70%** - No more repetitive retry logic or error handling
- **Consistency** - All queries/mutations behave the same way
- **Maintainability** - Update retry strategy in one place, applies everywhere
- **Type safety** - Full TypeScript support with generics

**Migration Example:**

<details>
<summary><b>Before (manual implementation - 35 lines)</b></summary>

```typescript
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        triggerError(error);
      } else {
        triggerError(new ApiError({
          title: "Error",
          status: 500,
          detail: error instanceof Error ? error.message : String(error),
        }));
      }
    },
  });
};
```
</details>

<details>
<summary><b>After (using generic hooks - 10 lines)</b></summary>

```typescript
export const useDepartments = () => {
  return useGenericQuery(['departments'], fetchDepartments);
};

export const useCreateDepartment = () => {
  return useGenericMutation({
    mutationFn: createDepartment,
    invalidateKeys: [['departments'], ['departments', 'stats']],
  });
};
```
</details>

#### Error Handling Setup

**Error handling is now managed by `ErrorProvider`** (see [Global Error Handling Documentation](../global-error/README.md))

The `ErrorProvider` is a separate, generic provider that handles all error types:
- API errors (HTTP/RFC 7807)
- Validation errors (forms/data)
- Future error types

```typescript
// error-provider.tsx - Centralized error handling
import { setGlobalErrorHandler, ApiError } from "@/frontend_lib/errors/api-errors";

setGlobalErrorHandler((error: ApiError) => {
  const detail = error.details.detail || error.message;
  const title = error.details.title;
  
  toast.error(detail || title, {
    description: detail ? title : undefined,
    duration: 5000,
  });
});

export function ErrorProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster position="bottom-right" />
      {children}
    </>
  );
}
```

**Provider Architecture:**
```
layout.tsx
  └─ ErrorProvider      ← Handles all error types globally
      └─ ApiProvider    ← Provides React Query client (no error handling)
          └─ App
```

**Benefits:**
- ✅ Separation of concerns - error handling separate from API logic
- ✅ Single source of truth - all error handlers in one place
- ✅ Extensible - easy to add new error types
- ✅ Easy to maintain - update error display logic once

**Important:** 
- Handler is set at **module load time**, not in a `useEffect`
- This ensures it's available before any mutations fire
- `ErrorProvider` must wrap `ApiProvider` in layout.tsx

#### `mutations.ts` - Automatic Error Handling

```typescript
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      // Refetch queries on success
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: unknown) => {
      // Always call triggerError
      if (error instanceof ApiError) {
        triggerError(error);
      } else {
        // Fallback for unexpected errors
        triggerError(new ApiError({
          title: "Error",
          status: 500,
          detail: error instanceof Error ? error.message : String(error),
        }));
      }
    },
  });
};
```

### 2. Error Flow Diagram

```
Component calls API function (e.g., createDepartment)
    ↓
┌─────────────────────────────────────────────────────┐
│ LAYER 1: Client-Side Validation (in api.ts)        │
│ - validateOrThrow() checks payload before fetch    │
│ - Throws ValidationError if data is invalid        │
│ - Prevents invalid data from reaching server       │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ Validation passed
               │
    API Call (fetch)
        ↓
┌─────────────────────────────────────────────────────┐
│ LAYER 2: HTTP Response Validation (handleResponse) │
│ - Checks res.ok after fetch completes              │
│ - Parses RFC 7807 errors or network errors         │
│ - Throws ApiError for any HTTP error               │
└──────────────┬──────────────────────────────────────┘
               │
    ├─ Success (res.ok === true)
    │   └─ Parse JSON and return data
    │
    └─ Error (res.ok === false)
        ├─ Parse RFC 7807 response
        ├─ Extract: title, status, detail, type
        └─ Throw ApiError
            ↓
        useGenericMutation catches error
            ├─ onError callback fires
            ├─ Calls notifyError()
            └─ Global handler displays toast
                ├─ Main message: error.details.detail
                └─ Description: error.details.title
```

**Key Points:**
- **Two validation layers** provide defense in depth
- **Layer 1** (client validation) = Immediate feedback, prevents bad requests
- **Layer 2** (response check) = Catches server errors, network issues, business logic errors
- Both layers throw typed errors (ValidationError or ApiError)
- Errors automatically trigger global error handlers → toast notifications

## RFC 7807 Error Response Format

The backend returns errors in this format:

```json
{
  "success": false,
  "type": "duplicate-department-name",
  "title": "Duplicate Department Name",
  "status": 409,
  "detail": "Department with name \"test\" already exists",
  "timestamp": "2026-03-28T13:16:03.401Z",
  "path": "/api/v1/departments",
  "instance": "/api/v1/departments"
}
```

The frontend extracts:
- `title` - Short error title (shown as description in toast)
- `detail` - Detailed error message (shown as main message in toast)
- `status` - HTTP status code
- `type` - Error type identifier for custom handling

## Validation Error Format

Validation errors provide field-level error information:

```typescript
// ValidationError instance
{
  message: "Validation failed",
  errors: {
    email: "Invalid email format",
    password: "Must be at least 8 characters",
    username: ["Required", "Must be unique"]
  },
  fieldErrors: [
    { field: "email", message: "Invalid email format" },
    { field: "password", message: "Must be at least 8 characters" },
    { field: "username", message: "Required, Must be unique" }
  ]
}
```

**Usage in forms:**
```typescript
catch (error) {
  if (error instanceof ValidationError) {
    // Show field-specific errors
    error.fieldErrors.forEach(({ field, message }) => {
      form.setError(field, { message });
    });
    
    // Or check specific field
    if (error.hasFieldError('email')) {
      const emailError = error.getFieldError('email');
    }
  }
}
```

## Usage Examples

### Creating a New API Module

**Modern Approach (Using Generic Hooks + Two-Layer Validation)** 🎯

1. **Create `validation.ts`** with frontend schemas:

```typescript
import { z } from 'zod';
import { ValidationError } from '@/frontend_lib/errors/validation-errors';

/**
 * Frontend Validation Schemas
 * These are SEPARATE from backend to avoid coupling (future Nest.js migration)
 * Backend reference: backend_lib/modules/core/validation/user-schema.ts
 */

export const createUserBodySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

export const updateUserBodySchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

// Validation helper
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      errors[err.path.join('.')] = err.message;
    });
    throw new ValidationError('Validation failed', errors);
  }
  return result.data;
}
```

2. **Create `api.ts`** with fetch functions + automatic validation:

```typescript
import { handleResponse } from '../config';
import { 
  createUserBodySchema, 
  updateUserBodySchema,
  validateOrThrow 
} from './validation';
import { User } from './types';

/**
 * IMPORTANT: Two-Layer Validation & Error Handling
 * -------------------------------------------------
 * 
 * LAYER 1 (Client Validation - BEFORE fetch):
 * - validateOrThrow() checks payload structure
 * - Throws ValidationError immediately if data is invalid
 * - Prevents sending bad data to server
 * 
 * LAYER 2 (Response Validation - AFTER fetch):
 * - handleResponse() checks res.ok
 * - Throws ApiError for HTTP errors (400, 404, 500, etc.)
 * - Parses RFC 7807 error responses
 * 
 * Both layers provide defense in depth!
 */

// Queries (no validation needed for GET requests)
export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch('/api/v1/users');
  const data = await handleResponse<{ data: User[] }>(res);
  return data.data;
};

export const fetchUserById = async (id: string): Promise<User> => {
  const res = await fetch(`/api/v1/users/${id}`);
  const data = await handleResponse<{ data: User }>(res);
  return data.data;
};

// Mutations (with automatic validation)
export const createUser = async (payload: Partial<User>): Promise<User> => {
  // ✅ LAYER 1: Validate before sending
  const validated = validateOrThrow(createUserBodySchema, payload);
  
  const res = await fetch('/api/v1/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated), // Send validated data
  });
  
  // ✅ LAYER 2: Check response status
  const data = await handleResponse<{ data: User }>(res);
  return data.data;
};

export const updateUser = async (id: string, payload: Partial<User>): Promise<User> => {
  // ✅ LAYER 1: Validate before sending
  const validated = validateOrThrow(updateUserBodySchema, payload);
  
  const res = await fetch(`/api/v1/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated), // Send validated data
  });
  
  // ✅ LAYER 2: Check response status
  const data = await handleResponse<{ data: User }>(res);
  return data.data;
};
```

3. **Create `queries.ts`** with generic query hooks:

```typescript
import { useGenericQuery } from '../config';
import { fetchUsers, fetchUserById } from './api';

export const useUsers = () => {
  return useGenericQuery(['users'], fetchUsers);
};

export const useUser = (id: string) => {
  return useGenericQuery(
    ['users', id],
    () => fetchUserById(id),
    { enabled: !!id }
  );
};
```

3. **Create `mutations.ts`** with generic mutation hooks:

```typescript
import { useGenericMutation } from '../config';
import { createUser } from './api';

export const useCreateUser = () => {
  return useGenericMutation({
    mutationFn: createUser,
    invalidateKeys: [['users']],
  });
};
```

4. **Use in component:**

```typescript
function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const { mutateAsync: createUser } = useCreateUser();
  
  const handleAdd = async (data: Partial<User>) => {
    try {
      // API layer validates automatically before calling fetch
      // ValidationError thrown immediately if data is invalid
      // ApiError thrown if server rejects the request
      await createUser(data);
      
      // Success! Modal closes automatically
      onClose();
    } catch (error) {
      // Both ValidationError and ApiError handled automatically:
      // - useGenericMutation calls notifyError() or notifyValidationError()
      // - ErrorProvider shows toast notification
      // - Modal stays open for retry
    }
  };
  
  return (/* ... */);
}
```

**Optional: Add form-level validation for better UX:**

```typescript
import { createUserBodySchema, validateOrThrow } from '@/frontend_lib/api/user';

function CreateUserForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutateAsync: createUser, isPending } = useCreateUser();
  
  const handleSubmit = async (formData: any) => {
    try {
      setErrors({});
      
      // OPTIONAL: Validate in form first for immediate feedback
      // This provides better UX by showing errors as user types
      const validated = validateOrThrow(createUserBodySchema, formData);
      
      // API layer validates again as safety net
      await createUser(validated);
      
      alert('User created!');
      onClose();
    } catch (error) {
      if (error instanceof ValidationError) {
        // Show field-specific errors in form
        const fieldErrors: Record<string, string> = {};
        error.fieldErrors.forEach(({ field, message }) => {
          fieldErrors[field] = message;
        });
        setErrors(fieldErrors);
      }
      // API errors handled automatically by useGenericMutation
    }
  };
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(getFormData(e)); }}>
      <input name="name" />
      {errors.name && <span className="error">{errors.name}</span>}
      
      <input name="email" type="email" />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

**Summary of validation layers:**

```
┌────────────────────────────────────────────────────────────────┐
│ LAYER 0 (Optional): Form-level validation                     │
│ - Validates as user types (progressive validation)            │
│ - Shows field-specific errors immediately                     │
│ - Best UX but requires form code                              │
│ - Use validateOrThrow() in form submit handler                │
└────────────────────────────────────────────────────────────────┘
                             ↓ Form validation passed
┌────────────────────────────────────────────────────────────────┐
│ LAYER 1 (Automatic): API-level validation                     │
│ - Validates before fetch() is called (in api.ts)              │
│ - Safety net if form validation is skipped                    │
│ - Throws ValidationError immediately                          │
│ - Prevents invalid data from being sent                       │
└────────────────────────────────────────────────────────────────┘
                             ↓ Client validation passed
┌────────────────────────────────────────────────────────────────┐
│ LAYER 2 (Automatic): Server response validation               │
│ - Checks res.ok after fetch() completes (handleResponse)      │
│ - Throws ApiError for HTTP errors                             │
│ - Handles 422 Validation, 409 Conflict, 500 Server Error      │
│ - Security: server always validates (never trust client)      │
└────────────────────────────────────────────────────────────────┘
```

## Query Error Handling Strategy

### Why Queries and Mutations Need Different Error Handling

Queries (GET requests) and mutations (POST/PUT/DELETE) have fundamentally different characteristics:

**Queries:**
- Triggered automatically on component mount, window focus, reconnection
- Can fire multiple times without user interaction
- Expected to fail sometimes (404, 403 are normal)
- Should show errors in UI state, not toasts (to avoid spam)

**Mutations:**
- Triggered explicitly by user actions (button clicks)
- Fire once per action
- Errors are unexpected and need immediate feedback
- Should show toasts to confirm the action failed

### Smart Retry Logic for Queries

**Implementation in `queries.ts`:**

```typescript
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    retry: (failureCount, error) => {
      // Don't retry on client errors (400-499)
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      // Retry server errors up to 2 times
      return failureCount < 2;
    },
  });
};
```

**Why this matters:**

| Status Code | Error Type | Should Retry? | Reason |
|-------------|------------|---------------|---------|
| 401 | Unauthorized | ❌ No | User needs to login first |
| 403 | Forbidden | ❌ No | User lacks permission |
| 404 | Not Found | ❌ No | Resource doesn't exist |
| 409 | Conflict | ❌ No | Business logic error |
| 422 | Validation | ❌ No | Data is invalid |
| 500 | Server Error | ✅ Yes | Server might recover |
| 503 | Unavailable | ✅ Yes | Service might come back |
| Network Error | Connection | ✅ Yes | Connection might restore |

### Component Error Display

Components should check the `error` state and display appropriate UI:

```typescript
function DepartmentsPage() {
  const { data: departments, isLoading, error } = useDepartments();
  const { data: stats, error: statsError } = useDepartmentStats();
  
  return (
    <DataViewLayout 
      isLoading={isLoading}
      error={error}  // ← Layout displays error UI
      data={departments || []}
    >
      <DepartmentsStats 
        stats={stats}
        error={statsError}  // ← Component shows its own error
      />
    </DataViewLayout>
  );
}
```

### When to Show Toasts for Queries

Only show toasts for **critical** query errors that need immediate attention:

```typescript
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    retry: (failureCount, error) => {
      // Smart retry logic...
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        // Critical: Session expired
        if (error.statusCode === 401) {
          triggerError(error);
        }
        // Critical: Server is down
        else if (error.statusCode >= 500) {
          triggerError(error);
        }
        // Don't toast 403/404 - show in UI only
      }
    },
  });
};
```

## Debug Logging

The system logs all error details to the browser console for debugging:

```
config.ts:62 API Error Response (parsed from text): {...}
config.ts:92 Throwing ApiError with detail: "..."
mutations.ts:15 Mutation error caught: ApiError
mutations.ts:16 Is ApiError? true
mutations.ts:20 Calling triggerError with ApiError
config.ts:119 triggerError called with: ApiError
error-provider.tsx Global API error handler triggered: ApiError
error-provider.tsx Showing toast with detail: "..."
```

To debug errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Trigger the error
4. Look for "API Error Response" to see the backend response
5. Look for "Global error handler triggered" to confirm display

## Error Handling Patterns

### Pattern 1: Show Error in Toast Only

```typescript
onError: (error: unknown) => {
  if (error instanceof ApiError) {
    triggerError(error); // Toast shown automatically
  }
}
```

### Pattern 2: Show Error + Keep Modal Open for Retry

```typescript
async function handleConfirm() {
  setIsLoading(true);
  try {
    await mutateAsync(data);
    onClose(); // Close only on success
  } catch (error) {
    // Error is shown via global handler
    setIsLoading(false); // Reset loading, keep modal open
  }
}
```

### Pattern 3: Custom Error Handling

```typescript
onError: (error: unknown) => {
  if (error instanceof ApiError) {
    // Custom logic based on error type
    if (error.details.type === 'duplicate-item') {
      // Handle duplicate errors specially
    }
    triggerError(error);
  }
}
```

### Pattern 4: Query Error Handling (GET Requests)

**For queries (GET requests), DON'T show toasts automatically** - instead, handle in the UI:

```typescript
// queries.ts - Smart retry logic
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: (failureCount, error) => {
      // Don't retry on client errors (400-499) - they won't fix themselves
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      // Retry server errors (500+) and network errors up to 2 times
      return failureCount < 2;
    },
  });
};

// Component - Display error in UI, not toast
function UsersPage() {
  const { data, isLoading, error } = useUsers();
  
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  return <UsersList users={data} />;
}
```

**Why queries are different from mutations:**

| Aspect | **Queries (GET)** | **Mutations (POST/PUT/DELETE)** |
|--------|-------------------|----------------------------------|
| **Trigger** | Automatic (mount/refocus) | User action (button click) |
| **Frequency** | Can happen repeatedly | One-time per action |
| **Display** | Show in UI (error state) | Show toast notification |
| **Retry** | Smart retry with backoff | Retry 1 time only |
| **User awareness** | Silent, shows error UI | Loud, immediate feedback |

**Common GET errors and retry strategy:**

```typescript
retry: (failureCount, error) => {
  if (error instanceof ApiError) {
    // 401 Unauthorized - Don't retry, user needs to login
    if (error.statusCode === 401) return false;
    
    // 403 Forbidden - Don't retry, user lacks permission
    if (error.statusCode === 403) return false;
    
    // 404 Not Found - Don't retry, resource doesn't exist
    if (error.statusCode === 404) return false;
    
    // 409/422 Business logic - Don't retry
    if (error.statusCode === 409 || error.statusCode === 422) return false;
    
    // 500/503 Server errors - Worth retrying
    // Network errors - Worth retrying
  }
  
  return failureCount < 2;
}
```

**Optional: Show toast only for critical query errors**

```typescript
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: (failureCount, error) => {
      // Smart retry logic...
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        // Only show toast for unexpected errors
        if (error.statusCode === 401) {
          triggerError(error); // User needs to login
        } else if (error.statusCode >= 500) {
          triggerError(error); // Server is down
        }
        // 403/404 = silent, show in UI only
      }
    },
  });
};
```

## Best Practices

✅ **DO:**
- **Use `useGenericQuery` and `useGenericMutation`** - Eliminates boilerplate and ensures consistency
- Use `handleResponse()` in all API functions
- Let the generic hooks handle error notifications automatically
- Keep modals/forms open on mutation errors so users can retry
- Log errors to console for debugging
- **For queries**: Display errors in UI components, not toasts (unless critical)
- **For queries**: Use `enabled` option to prevent unnecessary fetches
- Pass query `error` prop to components for UI display
- Use `invalidateKeys` option to auto-refresh data after mutations

❌ **DON'T:**
- Manually implement retry logic - use `useGenericQuery` instead
- Manually implement error callbacks - use `useGenericMutation` instead
- Use `fetch().json()` without error checking
- Call `alert()` or `console.error()` instead of using the error system
- Close modals on mutation errors
- Try to parse error responses manually
- Call `setGlobalErrorHandler()` inside `useEffect()`
- **For queries**: Show toast on every query error (causes spam)
- **For queries**: Ignore the `isError` state in components

## Files Modified

- `src/frontend_lib/errors/api-errors.ts` - **NEW** - API/HTTP error handling (RFC 7807)
- `src/frontend_lib/errors/validation-errors.ts` - **NEW** - Form/data validation errors
- `src/frontend_lib/errors/index.ts` - **NEW** - Unified exports for all error utilities
- `src/frontend_lib/api/config.ts` - **UPDATED** - Added `useGenericQuery` and `useGenericMutation` hooks + React Query config
- `src/frontend_lib/components/providers/error-provider.tsx` - **NEW** - Generic error provider (handles all error types)
- `src/frontend_lib/components/providers/api-provider.tsx` - **UPDATED** - Removed error handling (now in ErrorProvider)
- `src/frontend_lib/api/department/api.ts` - API functions with error handling
- `src/frontend_lib/api/department/mutations.ts` - **REFACTORED** - Now uses `useGenericMutation`
- `src/frontend_lib/api/department/queries.ts` - **REFACTORED** - Now uses `useGenericQuery`
- `src/app/globals.css` - Added Sonner styles
- `package.json` - Added sonner dependency

### Migration Notes

**Phase 1:** Original implementation was in `api/config.ts` with all error handling mixed with configuration.

**Phase 2:** Moved to `api/global-errors.ts` to separate error concerns from config.

**Phase 3:** Split into dedicated modules:
- **`errors/api-errors.ts`** - API/HTTP-specific error handling
- **`errors/validation-errors.ts`** - Validation-specific error handling  
- **`errors/index.ts`** - Convenience exports

**Phase 4 (Current):** Added generic reusable hooks:
- **`useGenericQuery`** - Smart query hook with automatic retry logic
- **`useGenericMutation`** - Mutation hook with error handling and cache invalidation
- Refactored department API to use generic hooks (reduced code by ~70%)

This evolution provides:
- ✅ Clear separation between API and validation errors
- ✅ Better organization for different error types
- ✅ **Massive reduction in boilerplate** with generic hooks
- ✅ Consistent behavior across all API modules
- ✅ Easier to extend with new error types
- ✅ Matches production best practices

Existing imports from `api/config` still work via re-exports.

## Related Documentation

### Error Handling
- **[Global Error Handling](../global-error/README.md)** - ⭐ Complete guide to `ErrorProvider` and centralized error handling
- [API Errors Module](../../../frontend_lib/errors/api-errors.ts) - API/HTTP error handling
- [Validation Errors Module](../../../frontend_lib/errors/validation-errors.ts) - Form/data validation
- [Errors Index](../../../frontend_lib/errors/index.ts) - Unified exports
- [ErrorProvider](../../../frontend_lib/components/providers/error-provider.tsx) - Generic error provider component

### API Configuration
- [API Config Module](../../../frontend_lib/api/config.ts) - React Query configuration & generic hooks
- [API Provider](../../../frontend_lib/components/providers/api-provider.tsx) - React Query provider

### External Resources
- [RFC 7807 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [Sonner Toast Documentation](https://sonner.emilkowal.ski/)
- [React Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- [Backend Error Handler](../../../backend_lib/shared/middlewares/error-handler.ts)
