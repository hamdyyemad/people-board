import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { jobService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { createJobBodySchema, updateJobBodySchema } from '@/backend_lib/modules/core/validation';
import { validateRequestBody } from '@/backend_lib/shared/validation';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

// ========================================================
// POST /api/v1/jobs - Create a new job
// ========================================================
export const POST = withMiddlewares(createJob);
async function createJob(request: NextRequest) {
  const result = await validateRequestBody(request, createJobBodySchema);
  if ('errorResponse' in result) return result.errorResponse;

  const { title, departmentId } = result.data;

  const job = await jobService.createJob({
    title,
    departmentId: departmentId ?? null,
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
// PUT /api/v1/jobs - Update a job
// ========================================================
export const PUT = withMiddlewares(updateJob);
async function updateJob(request: NextRequest) {
  const result = await validateRequestBody(request, updateJobBodySchema);
  if ('errorResponse' in result) return result.errorResponse;

  const { id, title, departmentId } = result.data;

  const job = await jobService.updateJob({
    id,
    title,
    departmentId: departmentId,
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