/**
 * Internal Server Error
 * 
 * Thrown for unexpected server errors (500 Internal Server Error)
 */

import { BaseError } from '../base';

export class InternalServerError extends BaseError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}

