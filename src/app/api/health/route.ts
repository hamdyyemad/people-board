import { NextRequest } from 'next/server';

// Middlewares
import { withErrorHandler, withRateLimit } from '@/backend_lib/middlewares';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

export const GET = withErrorHandler(withRateLimit(getBackendHealth));

/**
 * Backend Health Check
 * 
 * Verifies the backend service is running and responding.
 * Does not check external dependencies.
 * 
 * Response: 200 if service is up
 */
async function getBackendHealth(request: NextRequest) {
  return createSuccessResponse(
    request,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    200
  );
}