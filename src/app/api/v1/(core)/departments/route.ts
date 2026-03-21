import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { departmentService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { createDepartmentBodySchema } from '@/backend_lib/modules/core/validation';
import { validateRequestBody } from '@/backend_lib/shared/validation';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

export const POST = withMiddlewares(createDepartment);

async function createDepartment(request: NextRequest) {
  const result = await validateRequestBody(request, createDepartmentBodySchema);
  if ('errorResponse' in result) return result.errorResponse;

  const { name, parentId } = result.data;
  const department = await departmentService.createDepartment({
    name,
    parentId: parentId ?? null,
  });

  return createSuccessResponse(
    request,
    {
      id: department.id,
      name: department.name.value,
      parentId: department.parentId ?? null,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    },
    201
  );
}
