import { BaseEntity } from './base-entity';
import { JobTitle } from '../value-objects/job-title';
import { JobCreatedEvent } from '../events/job/job-created';
import { JOB_MESSAGES, JOB_TITLE_MESSAGES } from '../constants';

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
  }

  protected validate(): void {
    if (!this.id) throw new Error(JOB_MESSAGES.ID_EMPTY);
    if (!this.title) throw new Error(JOB_TITLE_MESSAGES.EMPTY);
    if (!this.departmentId) throw new Error(JOB_MESSAGES.DEPARTMENT_ID_EMPTY);
  }
}