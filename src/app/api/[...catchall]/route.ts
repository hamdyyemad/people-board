import { NextRequest } from 'next/server';
import { withErrorHandler, withRateLimit } from '@/backend_lib/shared/middlewares';
import { NotFoundError } from '@/backend_lib/shared/exceptions';

const handler = async (request: NextRequest) => {
  const path = new URL(request.url).pathname;
  throw new NotFoundError(`Route ${path} not found`);
};

export const GET = withErrorHandler(withRateLimit(handler));
export const POST = withErrorHandler(withRateLimit(handler));
export const PUT = withErrorHandler(withRateLimit(handler));
export const PATCH = withErrorHandler(withRateLimit(handler));
export const DELETE = withErrorHandler(withRateLimit(handler));
