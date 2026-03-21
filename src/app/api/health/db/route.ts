import { NextRequest } from 'next/server';

// Middlewares
import { withErrorHandler, withRateLimit } from '@/backend_lib/middlewares';

// HTTP Response Helpers
import { createSuccessResponse, createErrorResponseFromDetails } from '@/backend_lib/http/response';

// Database
import { DrizzleClient } from '@/backend_lib/shared/infrastructure/databases/drizzle-client';

export const GET = withErrorHandler(withRateLimit(getDatabaseHealth));

/**
 * Database Health Check
 * 
 * Verifies database connectivity and responsiveness.
 * 
 * Returns:
 * - 200 if database is healthy
 * - 503 if database is unreachable or slow
 */
async function getDatabaseHealth(request: NextRequest) {
  try {
    // Execute a simple query to verify connection
    const startTime = Date.now();
    await DrizzleClient.execute('SELECT 1');
    const responseTime = Date.now() - startTime;

    return createSuccessResponse(
      request,
      {
        status: 'healthy',
        database: 'connected',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      },
      200
    );
  } catch (error) {
    console.error('Database health check failed:', error);
    // Never send raw error.message to the client (can leak paths, stack, or DB details)
    const isProduction = process.env.NODE_ENV === 'production';
    const safeDetail = isProduction
    ? 'Database is unreachable or slow.'
    : (error instanceof Error ? error.message : 'Internal database error');

    return createErrorResponseFromDetails(
    request,
    'internal-database-error',
    'Internal Database Error',
    503,
    safeDetail
    );
    
  }
}