import { NextRequest } from 'next/server';
import { departmentService } from '@/backend_lib/modules/core/composition-root';
import { withMiddlewares } from '@/backend_lib/middlewares';
import { createSuccessResponse } from '@/backend_lib/http/response';

export const POST = withMiddlewares(createDepartment);

async function createDepartment(request: NextRequest) {
  const body = await request.json();
  const { name, parentId } = body ?? {};

  const department = await departmentService.createDepartment({ name, parentId });

  return createSuccessResponse(
    request,
    {
      id: department.id,
      name: department.name.value,
      parentId: department.parentId,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    },
    201
  );
}
