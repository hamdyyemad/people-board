/**
 * Entity ID Error
 * 
 * Thrown when an entity ID is invalid (400 Bad Request)
 * This error is used in the BaseEntity class to validate the ID format (UUID) and presence.
 * It is not meant to be thrown directly by application services or use cases, but rather as a result of invalid entity construction.
 * 
*/

import { BaseError } from '../base';

export class EntityIdError extends BaseError {
  constructor(message: string = 'Invalid Entity ID') {
    super(message, 400);
    this.name = 'EntityIdError';
  }
}

