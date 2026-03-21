import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { departmentService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { validateRouteParams } from '@/backend_lib/shared/validation/validate-request-body';
import { departmentIdParamSchema } from '@/backend_lib/modules/core/validation';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

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