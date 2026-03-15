/**
 * Forbidden Error
 * 
 * Thrown when authorization fails (403 Forbidden)
 */

import { BaseError } from '../base';

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

