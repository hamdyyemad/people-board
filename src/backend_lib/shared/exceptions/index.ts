/**
 * Exceptions Module
 * 
 * Centralized error handling system for the backend.
 * 
 * Structure:
 * - base/ - Base error classes
 * - types/ - Type definitions and error classes
 * 
 * Usage:
 *   import { ValidationError, NotFoundError } from '@/backend_lib/exceptions';
 *   throw new ValidationError('Invalid input');
 *   throw new NotFoundError('Price not found');
 */

// Base classes
export { BaseError } from './base';

// Error classes and types
export {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  EntityIdError,
  type ErrorResponse,
} from './types';
