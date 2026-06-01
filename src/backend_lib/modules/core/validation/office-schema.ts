import { z } from 'zod';
import { OFFICE_NAME, OFFICE_NAME_MESSAGES, OFFICE_ADDRESS, OFFICE_ADDRESS_MESSAGES } from '../domain/constants/office';
import { basePaginationQuerySchema } from '@/backend_lib/shared/validation';

// ---- Shared ----
const uuidRequired = z
  .string({ message: 'City id is required' })
  .uuid('City id must be a valid UUID');

const uuidOptional = z
  .union([
    z.string().uuid('City id must be a valid UUID'),
    z.literal('').transform(() => null),
    z.null(),
  ])
  .optional();

const nameSchema = z
  .string({ message: OFFICE_NAME_MESSAGES.EMPTY })
  .trim()
  .min(OFFICE_NAME.MIN_LENGTH, OFFICE_NAME_MESSAGES.EMPTY)
  .max(OFFICE_NAME.MAX_LENGTH, OFFICE_NAME_MESSAGES.TOO_LONG);

const addressSchema = z
  .union([
    z.string().trim().max(OFFICE_ADDRESS.MAX_LENGTH, OFFICE_ADDRESS_MESSAGES.TOO_LONG),
    z.literal('').transform(() => null),
    z.null(),
  ])
  .optional();

const coordinateSchema = z
  .union([
    z.string().trim(),
    z.literal('').transform(() => null),
    z.null(),
  ])
  .optional();

const ALLOWED_OFFICE_SORT_FIELDS = ['createdAt', 'name', 'updatedAt', 'cityName', 'countryName'] as const;

/**
 * GET /offices list query. Reuses generic pagination/sort; `sortBy` is whitelisted for
 * repository mapping. Use `uuidOptional` so `id=` does not fail validation.
 *
 * `sortBy` accepts comma-separated values (e.g. `name,createdAt`). Each element is validated
 * against the allowed column whitelist.
 */
export const officeQuerySchema = basePaginationQuerySchema.extend({
  id: uuidOptional,
  cityId: uuidOptional,
  countryId: uuidOptional,
  /** Filter field — keep loose for "search"; do not reuse strict `nameSchema` from create body. */
  name: z.string().trim().optional(),
  sortBy: z.string().default('createdAt').transform(v =>
    v.split(',').map(s => s.trim())
  ).refine(
    arr => arr.every(f => (ALLOWED_OFFICE_SORT_FIELDS as readonly string[]).includes(f)),
    { message: `sortBy must be one of: ${ALLOWED_OFFICE_SORT_FIELDS.join(', ')}` }
  ),
});

export type OfficeQuery = z.output<typeof officeQuerySchema>;

// ---- Create ----
export const createOfficeBodySchema = z.object({
  name: nameSchema.optional(),
  cityId: uuidRequired,
  address: addressSchema,
  latitude: coordinateSchema,
  longitude: coordinateSchema,
}).refine(
  (data) => {
    const hasLat = data.latitude !== null && data.latitude !== undefined && data.latitude !== '';
    const hasLon = data.longitude !== null && data.longitude !== undefined && data.longitude !== '';
    return hasLat === hasLon; // Both must be present or both must be absent
  },
  {
    message: 'Latitude and longitude must both be provided or both be omitted',
    path: ['coordinates'],
  }
);

export type CreateOfficeBody = z.infer<typeof createOfficeBodySchema>;

// ---- Update ----
export const updateOfficeBodySchema = z.object({
  name: nameSchema.optional(),
  cityId: z
    .union([
      z.string().uuid('City id must be a valid UUID'),
      z.literal('').transform(() => undefined),
      z.undefined(),
    ])
    .optional(),
  address: addressSchema,
  latitude: coordinateSchema,
  longitude: coordinateSchema,
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    const hasLat = data.latitude !== null && data.latitude !== undefined && data.latitude !== '';
    const hasLon = data.longitude !== null && data.longitude !== undefined && data.longitude !== '';
    return hasLat === hasLon; // Both must be present or both must be absent
  },
  {
    message: 'Latitude and longitude must both be provided or both be omitted',
    path: ['coordinates'],
  }
);

export type UpdateOfficeBody = z.infer<typeof updateOfficeBodySchema>;

// ---- Read (e.g. path/query params) ----
export const officeIdParamSchema = z.object({
  id: z.string().uuid('Office id must be a valid UUID'),
});

export type OfficeIdParam = z.infer<typeof officeIdParamSchema>;

export const officeCityParamSchema = z.object({
  cityId: z.string().uuid('City id must be a valid UUID'),
});

export type OfficeCityParam = z.infer<typeof officeCityParamSchema>;
