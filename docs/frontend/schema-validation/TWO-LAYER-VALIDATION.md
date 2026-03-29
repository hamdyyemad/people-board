# Two-Layer Validation System

## Overview

Our API functions now implement **automatic two-layer validation** to provide defense in depth and prevent invalid data from reaching the server.

## Validation Architecture

### Folder Structure

```
frontend_lib/
├── validation/                      ← General utilities (shared)
│   ├── index.ts                    - Main exports
│   ├── zod.ts                      - Validation helpers & common schemas
│   └── README.md                   - Documentation
└── api/
    └── department/
        ├── api.ts                  ← API functions with validation
        └── validation.ts           ← Department-specific schemas
```

**Key Principles:**
- **General utilities** (`validation/`) - Shared across all modules (validateOrThrow, uuidOptional, etc.)
- **Module schemas** (`api/*/validation.ts`) - Module-specific validation rules only
- **Reusability** - Common validation logic defined once, used everywhere
- **DRY** - No duplicate validation code

### Quick Reference

```typescript
// Import general utilities
import { validateOrThrow, uuidOptional } from '@/frontend_lib/validation';

// Or import from module (re-exports general utilities)
import { validateOrThrow, createDepartmentBodySchema } from '@/frontend_lib/api/department';
```

## The Two Layers

### Layer 1: Client-Side Validation (Automatic in api.ts)

**Location:** Inside API functions (api.ts), before `fetch()` call  
**Purpose:** Validate payload structure AND URL parameters (e.g., UUIDs) before sending to server  
**Throws:** `ValidationError` if data is invalid  
**Benefit:** Prevents bad requests, saves network bandwidth

```typescript
// In api.ts - Mutation with payload validation
export const createDepartment = async (payload: Partial<Department>): Promise<Department> => {
  // ✅ LAYER 1: Validate payload before sending
  const validated = validateOrThrow(createDepartmentBodySchema, payload);
  
  const res = await fetch('/api/v1/departments', {
    method: 'POST',
    body: JSON.stringify(validated), // Send validated data
  });
  
  // ... Layer 2 below
};

// In api.ts - Update with both ID and payload validation
export const updateDepartment = async (id: string, payload: Partial<Department>): Promise<Department> => {
  // ✅ LAYER 1: Validate ID is a valid UUID
  validateOrThrow(departmentIdParamSchema, { id });
  // ✅ LAYER 1: Validate payload structure
  const validated = validateOrThrow(updateDepartmentBodySchema, payload);
  
  const res = await fetch(`/api/v1/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(validated),
  });
  
  // ... Layer 2 below
};

// In api.ts - Query with ID validation
export const fetchDepartmentById = async (id: string): Promise<Department | undefined> => {
  // ✅ LAYER 1: Validate ID is a valid UUID
  validateOrThrow(departmentIdParamSchema, { id });
  
  const res = await fetch(`/api/v1/departments/${id}`);
  
  // ... Layer 2 below
};
```

### Layer 2: HTTP Response Validation (Automatic in handleResponse)

**Location:** After `fetch()` completes, inside `handleResponse()`  
**Purpose:** Check if server accepted the request  
**Throws:** `ApiError` for HTTP errors (400, 404, 500, etc.)  
**Benefit:** Catches server-side validation, business logic errors, system errors

```typescript
// In api.ts (continued)
export const createDepartment = async (payload: Partial<Department>): Promise<Department> => {
  // ... Layer 1 above
  
  const res = await fetch('/api/v1/departments', {
    method: 'POST',
    body: JSON.stringify(validated),
  });
  
  // ✅ LAYER 2: Check response status
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};
```

## Complete Flow

```
Component: await createDepartment(formData)
                    ↓
┌─────────────────────────────────────────────────────────┐
│ LAYER 1: Client Validation (api.ts)                    │
│                                                         │
│ validateOrThrow(departmentIdParamSchema, { id })       │
│ validateOrThrow(createDepartmentBodySchema, formData)  │
│                                                         │
│ Checks:                                                 │
│ - id: valid UUID format (123e4567-e89b...)            │
│ - name: 2-100 characters, trimmed                      │
│ - parentId: valid UUID or null                         │
│                                                         │
│ ❌ If invalid: Throws ValidationError                  │
│    → useGenericMutation catches it                     │
│    → notifyValidationError() called                    │
│    → Toast: "Department ID must be a valid UUID"       │
│    → Function returns early, no API call               │
│                                                         │
│ ✅ If valid: Continue to fetch()                       │
└─────────────────────────────────────────────────────────┘
                    ↓ Validation passed
┌─────────────────────────────────────────────────────────┐
│ Network: fetch('/api/v1/departments', { POST })        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ LAYER 2: Response Validation (handleResponse)          │
│                                                         │
│ handleResponse(res) checks res.ok                      │
│                                                         │
│ ❌ If res.ok === false:                                │
│    - Parses RFC 7807 error response                    │
│    - Throws ApiError with details                      │
│    → useGenericMutation catches it                     │
│    → notifyError() called                              │
│    → Toast: "Department name must be unique"           │
│    → Modal stays open for retry                        │
│                                                         │
│ ✅ If res.ok === true:                                 │
│    - Parses JSON response                              │
│    - Returns data                                       │
│    → Success! Modal closes                             │
└─────────────────────────────────────────────────────────┘
```

## Error Types by Layer

### Layer 1 Errors (Client Validation)

**Caught before network call**

| Error | Example | Status | Toast Message |
|-------|---------|--------|---------------|
| Empty name | `{ name: "" }` | N/A | "Department name must be at least 2 characters" |
| Name too long | `{ name: "a".repeat(101) }` | N/A | "Department name must be 100 characters or less" |
| Invalid UUID | `{ parentId: "invalid" }` | N/A | "Parent department must be a valid UUID" |
| Invalid ID param | `updateDepartment("invalid-id", {...})` | N/A | "Department ID must be a valid UUID" |
| Missing required | `{}` | N/A | "Department name is required" |

**Benefit:** User sees error immediately, no server round-trip, no network usage

### Layer 2 Errors (Server Response)

**Caught after network call**

| Error | Example | Status | Toast Message |
|-------|---------|--------|---------------|
| Duplicate name | Server: "Name exists" | 409 | "Department with name 'Engineering' already exists" |
| Business logic | Server: "Cannot delete with children" | 409 | "Cannot delete department with sub-departments" |
| Not found | GET /departments/invalid-id | 404 | "Department not found" |
| Server error | Server crash | 500 | "Internal server error" |
| Network failure | No internet | 0 | "Network connection failed" |

**Benefit:** Catches business logic errors, permission errors, server failures

## Why Two Layers?

### Why not just Layer 1 (client validation)?

❌ **Client can be bypassed**
- Malicious users can modify requests
- Browser extensions can interfere
- API can be called directly (curl, Postman)

❌ **Can't catch business logic errors**
- Duplicate names (requires database check)
- Referenced entities (check foreign keys)
- Complex rules (multi-table validation)

### Why not just Layer 2 (server validation)?

❌ **Poor user experience**
- Wait for network round-trip to see errors
- Wasted bandwidth for invalid data
- Slower feedback loop

❌ **Increased server load**
- Process and validate every invalid request
- More database queries for simple errors
- Higher costs

### Two Layers = Defense in Depth ✅

- **Layer 1** = Fast feedback, good UX, reduced server load
- **Layer 2** = Security, business logic, system integrity
- **Together** = Best of both worlds!

## Usage in Components

### Automatic (No Extra Code)

```typescript
// Component
const { mutateAsync: createDepartment } = useCreateDepartment();

const handleSubmit = async (formData: any) => {
  try {
    // Both validation layers happen automatically!
    await createDepartment(formData);
    alert('Success!');
  } catch (error) {
    // Both ValidationError and ApiError handled automatically
    // Toast shown by ErrorProvider
  }
};
```

### Optional: Form-Level Validation for Better UX

```typescript
import { createDepartmentBodySchema, validateOrThrow } from './validation';

const handleSubmit = async (formData: any) => {
  try {
    // OPTIONAL: Validate in form first for immediate feedback
    const validated = validateOrThrow(createDepartmentBodySchema, formData);
    
    // API layer validates again as safety net
    await createDepartment(validated);
    
    alert('Success!');
  } catch (error) {
    if (error instanceof ValidationError) {
      // Show field-specific errors in form
      showFieldErrors(error);
    }
    // API errors handled automatically
  }
};
```

## Summary

### What You Get:

✅ **Automatic client validation** - Validates both payloads AND URL parameters (UUIDs)  
✅ **Automatic error handling** - Toasts shown automatically  
✅ **Type safety** - TypeScript + Zod schemas  
✅ **Defense in depth** - Two layers of protection  
✅ **Good UX** - Immediate feedback for validation errors  
✅ **Security** - Server always validates (never trust client)  
✅ **Future-proof** - Frontend schemas separate from backend  
✅ **Prevents invalid IDs** - UUID validation before API calls

### Validation Coverage:

- ✅ **Create**: Validates payload (name, parentId)
- ✅ **Update**: Validates ID parameter + payload
- ✅ **Delete**: Validates ID parameter
- ✅ **Fetch by ID**: Validates ID parameter

### Files Updated:

1. **[validation/zod.ts](../../src/frontend_lib/validation/zod.ts)** - General validation utilities
2. **[validation/index.ts](../../src/frontend_lib/validation/index.ts)** - Main exports
3. **[validation/README.md](../../src/frontend_lib/validation/README.md)** - Validation utilities docs
4. **[api/department/validation.ts](../../src/frontend_lib/api/department/validation.ts)** - Department schemas
5. **[api/department/api.ts](../../src/frontend_lib/api/department/api.ts)** - Added validation to mutations
6. **[TWO-LAYER-VALIDATION.md](./TWO-LAYER-VALIDATION.md)** - This document
7. **[VALIDATION.md](./VALIDATION.md)** - Architecture decision

### Related Documentation:

- [Validation Utilities](../../src/frontend_lib/validation/README.md) - General validation helpers
- [API Configuration & Error Handling](../api-config/README.md) - Complete API guide
- [Global Error Handling](../global-error/README.md) - Error provider and flow
- [Validation Decision](./VALIDATION.md) - Why separate schemas
