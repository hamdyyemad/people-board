# Frontend Validation Utilities

This folder contains general-purpose validation utilities and schema helpers that can be reused across all API modules.

## Structure

```
validation/
├── index.ts          - Main exports (import from here)
├── zod.ts            - Zod validation utilities and common schemas
└── README.md         - This file
```

## What Goes Here?

### ✅ General Validation Utilities

- `validateOrThrow()` - Validates and throws ValidationError if invalid
- `validateSafe()` - Validates and returns result object
- `validateField()` - Validates a single field

### ✅ Common Schema Helpers

- `uuidOptional` - Optional UUID validation
- `uuidRequired` - Required UUID validation
- `emailSchema` - Email validation
- `passwordSchema` - Password validation
- `urlSchema` - URL validation
- `phoneSchema` - Phone number validation

### ❌ Module-Specific Schemas

Module-specific schemas should stay in their respective API folders:
- `api/department/validation.ts` - Department schemas
- `api/user/validation.ts` - User schemas
- `api/attendance/validation.ts` - Attendance schemas
- etc.

## Usage

### In API Modules

```typescript
// api/department/validation.ts
import { z } from 'zod';
import { validateOrThrow, validateSafe, uuidOptional } from '@/frontend_lib/validation';

// Define department-specific schemas
export const createDepartmentBodySchema = z.object({
  name: z.string().min(2).max(100),
  parentId: uuidOptional, // ← Use general helper
});

// Re-export general utilities for convenience
export { validateOrThrow, validateSafe } from '@/frontend_lib/validation';
```

### In Components/Forms

```typescript
import { validateOrThrow } from '@/frontend_lib/validation';
import { createDepartmentBodySchema } from '@/frontend_lib/api/department';

const handleSubmit = async (formData: any) => {
  try {
    // Validate before API call
    const validated = validateOrThrow(createDepartmentBodySchema, formData);
    await createDepartment(validated);
  } catch (error) {
    // Handle validation errors
  }
};
```

## Benefits

### ✅ DRY (Don't Repeat Yourself)
- Validation logic defined once, used everywhere
- No duplicate code across modules

### ✅ Consistency
- All modules use the same validation approach
- Consistent error handling

### ✅ Maintainability
- Update validation logic in one place
- Easy to add new validation helpers

### ✅ Testability
- General utilities can be tested independently
- Module-specific schemas test against general utilities

## Adding New Validation Helpers

When adding new general validation helpers:

1. **Add to `zod.ts`**:
```typescript
// zod.ts
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format');
```

2. **Export from `index.ts`**:
```typescript
// index.ts
export { dateSchema } from './zod';
```

3. **Use in module-specific validation**:
```typescript
// api/attendance/validation.ts
import { dateSchema } from '@/frontend_lib/validation';

export const createAttendanceSchema = z.object({
  date: dateSchema, // ← Use general helper
  employeeId: z.string().uuid(),
});
```

## Testing

Test general utilities independently:

```typescript
// validation/__tests__/zod.test.ts
import { validateOrThrow, validateSafe, uuidOptional } from '../zod';
import { z } from 'zod';

describe('validateOrThrow', () => {
  it('should validate valid data', () => {
    const schema = z.object({ name: z.string() });
    const result = validateOrThrow(schema, { name: 'Test' });
    expect(result).toEqual({ name: 'Test' });
  });

  it('should throw ValidationError for invalid data', () => {
    const schema = z.object({ name: z.string() });
    expect(() => validateOrThrow(schema, {})).toThrow(ValidationError);
  });
});
```

## Related Documentation

- [Two-Layer Validation](../../docs/frontend/TWO-LAYER-VALIDATION.md) - Complete validation architecture
- [API Configuration](../../docs/frontend/api-config/README.md) - API error handling
- [Department Validation](../api/department/VALIDATION.md) - Example module-specific validation
