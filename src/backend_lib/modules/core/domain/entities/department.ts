import { BaseEntity } from './base-entity';
import { DepartmentName } from "../value-objects/department-name";
import { DepartmentCreatedEvent } from '../events/department/department-created';
import { DEPARTMENT_MESSAGES } from '../constants';

/**
 * Department Entity
 * 
 * Database Table: departments
 * Schema Last Updated: 2026-03-11 (migration 001_initial_schema.sql)
 * 
 * Table Structure:
 *   id UUID PRIMARY KEY
 *   parent_id UUID REFERENCES departments(id)
 *   name TEXT NOT NULL
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 *   deleted_at TIMESTAMPTZ
 */
// ==================================================================
//💡 Common DDD rule: 
// Entities are mutable, but Value Objects are immutable.
// ==================================================================
// src/backend_lib/modules/core/domain/entities/department.ts

export class Department extends BaseEntity<DepartmentCreatedEvent> {
  constructor(
    public id: string,
    public name: DepartmentName,
    public parentId: string | null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    // this.validate() is called in BaseEntity constructor, so it will run after the subclass properties are initialized.
    super(id, createdAt, updatedAt, deletedAt);
  }

  protected validate(): void {
    if (!this.id) throw new Error(DEPARTMENT_MESSAGES.ID_EMPTY);
    if (this.parentId === this.id) {
      throw new Error(DEPARTMENT_MESSAGES.OWN_PARENT);
    }
  }

  canHaveParent(parentId: string | null): boolean {
    // Prevent circular hierarchy (basic check at entity level)
    return parentId !== this.id;
  }
}