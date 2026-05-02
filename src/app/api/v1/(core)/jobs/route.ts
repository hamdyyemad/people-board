import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { jobService } from '@/backend_lib/modules/core/composition-root';

// Validation
import { validateRequestBody, validateRequestQueryParams } from '@/backend_lib/shared/validation';
import { createJobBodySchema, jobQuerySchema, type JobQuery } from '@/backend_lib/modules/core/validation/job-schema';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

// ========================================================
// GET /api/v1/jobs - List jobs with optional filters and pagination
// ========================================================
export const GET = withMiddlewares(getJobs);
async function getJobs(request: NextRequest) {
  // Validate query parameters
  const queryResult = validateRequestQueryParams(request, jobQuerySchema);   
  if ('errorResponse' in queryResult) return queryResult.errorResponse;
  
  // Get all jobs
  const jobs = await jobService.getJobs(queryResult.data as JobQuery);
  
  return createSuccessResponse(
    request,
    jobs,
    200
  );
}

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