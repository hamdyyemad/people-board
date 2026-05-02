import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { jobService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { jobIdParamSchema, updateJobBodySchema } from '@/backend_lib/modules/core/validation';
import { validateRequestBody } from '@/backend_lib/shared/validation';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';
import { validateRouteParams } from '@/backend_lib/shared/validation/validate-request';

// ========================================================
// GET /api/v1/jobs/:id - Get a job by ID
// ========================================================
export const GET = withMiddlewares(getJobById);
async function getJobById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
   // Await the params (Next.js 15+)
  const resolvedParams = await params;
  
  // Validate route parameters
  const paramResult = validateRouteParams(resolvedParams, jobIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  const { id } = paramResult.data;

  const job = await jobService.getJobById(id);
   
  return createSuccessResponse(
    request,
    job,
    200
  );
}

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

// ========================================================
// DELETE /api/v1/jobs/:id - Delete a job by ID
// ========================================================
export const DELETE = withMiddlewares(deleteJob);
async function deleteJob(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params (Next.js 15+)
  const resolvedParams = await params;
  
  // Validate route parameters
  const paramResult = validateRouteParams(resolvedParams, jobIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;
  
  const { id } = paramResult.data;

  await jobService.deleteJob(id);

  // Return success response (NextResponse.json doesn't support 204 with body)
  return createSuccessResponse(
    request,
    null,
    200
  );
}