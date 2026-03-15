/**
 * Unauthorized Error
 * 
 * Thrown when authentication fails (401 Unauthorized)
 */

import { BaseError } from '../base';

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

