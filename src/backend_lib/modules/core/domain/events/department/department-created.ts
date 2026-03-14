// src/backend_lib/modules/core/domain/events/department-created.ts
export class DepartmentCreatedEvent {
  constructor(
    public departmentId: string,
    public departmentName: string,
    public parentId: string | null,
    public occurredAt: Date = new Date()
  ) {}
}