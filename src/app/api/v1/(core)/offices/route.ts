import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { officeService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { validateRequestBody, validateRequestQueryParams } from '@/backend_lib/shared/validation';
import { createOfficeBodySchema, officeQuerySchema, type OfficeQuery } from '@/backend_lib/modules/core/validation/office-schema';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

// ========================================================
// GET /api/v1/offices - List offices with optional filters and pagination
// ========================================================
export const GET = withMiddlewares(getOffices);
async function getOffices(request: NextRequest) {
  const queryResult = validateRequestQueryParams(request, officeQuerySchema);
  if ('errorResponse' in queryResult) return queryResult.errorResponse;

  const offices = await officeService.getOffices(queryResult.data as OfficeQuery);

  return createSuccessResponse(request, offices, 200);
}

// ========================================================
// POST /api/v1/offices - Create a new office
// ========================================================
export const POST = withMiddlewares(createOffice);
async function createOffice(request: NextRequest) {
  const result = await validateRequestBody(request, createOfficeBodySchema);
  if ('errorResponse' in result) return result.errorResponse;

  const { name, cityId, address, latitude, longitude } = result.data;

  const office = await officeService.createOffice({
    name,
    cityId,
    address: address ?? null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  });

  return createSuccessResponse(request, office, 201);
}
