import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { departmentService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { createDepartmentBodySchema, departmentIdParamSchema } from '@/backend_lib/modules/core/validation';
import { validateRequestBody } from '@/backend_lib/shared/validation';
import { validateRequestQueryParams } from '@/backend_lib/shared/validation/validate-request-body';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

export const GET = withMiddlewares(getDepartment);
export const POST = withMiddlewares(createDepartment);

async function createDepartment(request: NextRequest) {
  const result = await validateRequestBody(request, createDepartmentBodySchema);
  if ('errorResponse' in result) return result.errorResponse;

  const { name, parentId } = result.data;
  const department = await departmentService.createDepartment({
    name,
    parentId: parentId ?? null,
  });

  return createSuccessResponse(request, department, 201);
}

async function getDepartment(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hasId = searchParams.has('id');

  let department;

   if (hasId) {
    // Validate the ID parameter
    const paramResult = validateRequestQueryParams(request, departmentIdParamSchema);
    if ('errorResponse' in paramResult) return paramResult.errorResponse;

    // Get single department by ID
    const { id } = paramResult.data;
    department = await departmentService.getDepartmentById(id);
  } else {
    // Get all departments
    department = await departmentService.getDepartments();
  }

   return createSuccessResponse(
    request,
    department,
    200
  );
}