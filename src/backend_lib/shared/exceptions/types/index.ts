/**
 * Exception Types and Classes
 * 
 * Type definitions and error classes for the exception system
 */

export type { ErrorResponse } from '../../http/types';
export { ValidationError } from './validation-error';
export { NotFoundError } from './not-found-error';
export { UnauthorizedError } from './unauthorized-error';
export { ForbiddenError } from './forbidden-error';
export { InternalServerError } from './internal-server-error';
export { EntityIdError } from './entity-id-error';

