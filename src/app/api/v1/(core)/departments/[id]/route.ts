import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { departmentService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { validateRouteParams, validateRequestBody } from '@/backend_lib/shared/validation/validate-request-body';
import { departmentIdParamSchema, updateDepartmentBodySchema } from '@/backend_lib/modules/core/validation';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

// ========================================================
// GET /api/v1/departments/:id - Get a department by ID
// ========================================================
export const GET = withMiddlewares(getDepartmentById);
async function getDepartmentById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
   // Await the params (Next.js 15+)
  const resolvedParams = await params;
  
  // Validate route parameters
  const paramResult = validateRouteParams(resolvedParams, departmentIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  const { id } = paramResult.data;

  const department = await departmentService.getDepartmentById(id);
   
  return createSuccessResponse(
    request,
    department,
    200
  );
}

// ========================================================
// PUT /api/v1/departments/:id - Update a department by ID
// ========================================================
export const PUT = withMiddlewares(updateDepartment);
async function updateDepartment(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params (Next.js 15+)
  const resolvedParams = await params;
  
  // Validate route parameters
  const paramResult = validateRouteParams(resolvedParams, departmentIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  const { id } = paramResult.data;

  // Validate request body
  const bodyResult = await validateRequestBody(request, updateDepartmentBodySchema);
  if ('errorResponse' in bodyResult) return bodyResult.errorResponse;

  const { name, parentId } = bodyResult.data;

  // Update the department
  const updatedDepartment = await departmentService.updateDepartment({
    id,
    name,
    parentId: parentId ?? undefined,
  });

  return createSuccessResponse(
    request,
    updatedDepartment,
    200
  );
}

// ========================================================
// DELETE /api/v1/departments/:id - Delete a department by ID
// ========================================================
export const DELETE = withMiddlewares(deleteDepartment);
async function deleteDepartment(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params (Next.js 15+)
  const resolvedParams = await params;
  
  // Validate route parameters
  const paramResult = validateRouteParams(resolvedParams, departmentIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  const { id } = paramResult.data;

  // Delete the department
  await departmentService.deleteDepartment(id);

  // Return success response (NextResponse.json doesn't support 204 with body)
  return createSuccessResponse(
    request,
    null,
    200
  );
}