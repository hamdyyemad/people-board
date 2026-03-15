/**
 * Not Found Error
 * 
 * Thrown when a requested resource is not found (404 Not Found)
 */

import { BaseError } from '../base';

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

