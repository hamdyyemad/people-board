// src/backend_lib/modules/core/application/dto/job.dto.ts
export class CreateJobDTO {
  constructor(
    public title: string,
    public departmentId: string
  ) {}
}

export class UpdateJobDTO {
  constructor(
    public id: string,
    public departmentId?: string,
    public title?: string,
  ) {}
}

export class JobResponseDTO {
  constructor(
    public id: string,
    public title: string,
    public departmentId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public isActive: boolean
  ) {}
}