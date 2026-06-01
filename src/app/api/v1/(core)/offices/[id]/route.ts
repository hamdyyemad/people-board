import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { officeService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { officeIdParamSchema, updateOfficeBodySchema } from '@/backend_lib/modules/core/validation/office-schema';
import { validateRequestBody, validateRouteParams } from '@/backend_lib/shared/validation/validate-request';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

// ========================================================
// GET /api/v1/offices/:id - Get an office by ID
// ========================================================
export const GET = withMiddlewares(getOfficeById);
async function getOfficeById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  const paramResult = validateRouteParams(resolvedParams, officeIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  const office = await officeService.getOfficeById(paramResult.data.id);

  return createSuccessResponse(request, office, 200);
}

// ========================================================
// PUT /api/v1/offices/:id - Update an office
// ========================================================
export const PUT = withMiddlewares(updateOffice);
async function updateOffice(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  const paramResult = validateRouteParams(resolvedParams, officeIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  const result = await validateRequestBody(request, updateOfficeBodySchema);
  if ('errorResponse' in result) return result.errorResponse;

  const { name, cityId, address, latitude, longitude, isActive } = result.data;

  const office = await officeService.updateOffice({
    id: paramResult.data.id,
    name,
    cityId,
    address: address ?? null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    isActive,
  });

  return createSuccessResponse(request, office, 200);
}

// ========================================================
// DELETE /api/v1/offices/:id - Delete an office
// ========================================================
export const DELETE = withMiddlewares(deleteOffice);
async function deleteOffice(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  const paramResult = validateRouteParams(resolvedParams, officeIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  await officeService.deleteOffice(paramResult.data.id);

  return createSuccessResponse(request, null, 200);
}
