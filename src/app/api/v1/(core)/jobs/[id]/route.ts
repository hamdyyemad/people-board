import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { jobService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { createJobBodySchema, jobIdParamSchema, updateJobBodySchema } from '@/backend_lib/modules/core/validation';
import { validateRequestBody } from '@/backend_lib/shared/validation';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';
import { validateRouteParams } from '@/backend_lib/shared/validation/validate-request-body';

// ========================================================
// PUT /api/v1/jobs/:id - Update a job
// ========================================================
export const PUT = withMiddlewares(updateJob);
async function updateJob(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params (Next.js 15+)
  const resolvedParams = await params;
  
  // Validate route parameters
  const paramResult = validateRouteParams(resolvedParams, jobIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;
  
  const { id } = paramResult.data;
  
    // Validate request body
  const result = await validateRequestBody(request, updateJobBodySchema);
  if ('errorResponse' in result) return result.errorResponse;

  const { title, departmentId } = result.data;

  const job = await jobService.updateJob({
    id,
    title: title ?? "",
    departmentId: departmentId ?? "",
  });

  return createSuccessResponse(
    request,
    {
      id: job.id,
      title: job.title,
      departmentId: job.departmentId ?? null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    },
    201
  );
}