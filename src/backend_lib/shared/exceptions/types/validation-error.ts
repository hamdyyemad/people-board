/**
 * Validation Error
 * 
 * Thrown when input validation fails (400 Bad Request)
 */

import { BaseError } from '../base';

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

