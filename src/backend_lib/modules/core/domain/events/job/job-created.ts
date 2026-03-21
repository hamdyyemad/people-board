// src/backend_lib/modules/core/domain/events/job-created.ts
export class JobCreatedEvent {
  constructor(
    public jobId: string,
    public jobTitle: string,
    public departmentId: string,
    public occurredAt: Date = new Date()
  ) {}
}