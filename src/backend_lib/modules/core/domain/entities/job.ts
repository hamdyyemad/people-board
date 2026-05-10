/**
 * Job Entity
 * 
 * Database Table: jobs
 * Represents a job position that belongs to a department.
 * 
 * Table Structure:
 *   id UUID PRIMARY KEY
 *   title TEXT NOT NULL
 *   department_id UUID NOT NULL REFERENCES departments(id)
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 *   deleted_at TIMESTAMPTZ
 */
// ==================================================================
//💡 Common DDD rule: 
// Entities are mutable, but Value Objects are immutable.
// ==================================================================
// src/backend_lib/modules/core/domain/entities/job.ts

// BaseEntity is the base class for all entities in the domain. It provides common properties and methods for managing domain events, soft deletion, and validation. Each entity must implement its own validation logic by overriding the abstract validate() method. The constructor initializes the entity with an id and timestamps, and calls validation methods to ensure the entity is in a valid state upon creation. Domain events can be added, retrieved, and cleared using the provided methods.
import { BaseEntity } from './base-entity';
// Value Object
import { JobTitle } from '../value-objects/job';
// Domain Events
import { JobCreatedEvent } from '../events/job/job-created';
// Constants
import { JOB_MESSAGES, JOB_TITLE_MESSAGES } from '../constants';
// We have moved the validation logic for the entity ID into the BaseEntity class, since all entities share the same requirements for their IDs (non-empty and UUID-shaped). This promotes code reuse and consistency across all entities. Each entity can still implement its own specific validation logic in the validate() method, but they will all benefit from the shared ID validation logic in the base class.
import { isUuid } from '@/backend_lib/shared/validation';
// We have moved the EntityIdError into the shared exceptions module, since it is a common error type that can be used across multiple entities and modules in the application. This promotes better organization and reuse of error types, and keeps our domain entities focused on their specific business logic rather than error handling details.
import { EntityIdError } from '@/backend_lib/shared/exceptions';

export class Job extends BaseEntity<JobCreatedEvent> {
  constructor(
    public id: string,
    public title: JobTitle,
    public departmentId: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    // this.validate() is called in BaseEntity constructor, so it will run after the subclass properties are initialized.
    super(id, createdAt, updatedAt, deletedAt);
    this.init(); // Call init to perform validation after construction
  }

  protected validate(): void {
    // this.init() already runs this.validateId behind the scenes, no need to type it again
    
    if (!this.title) throw new Error(JOB_TITLE_MESSAGES.EMPTY);
    if (!isUuid(this.departmentId)) throw new EntityIdError(JOB_MESSAGES.ID_NOT_FOUND);
  }
}