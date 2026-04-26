import { isUuid } from '@/backend_lib/shared/validation';
import { ValidationError, EntityIdError } from '@/backend_lib/shared/exceptions';

// ################# DTOs #################
export class CreateJobDTOInput {
  constructor(
    public readonly title: string,
    public readonly departmentId: string
  ) {
    if (!title || title.trim() === '') {
      throw new ValidationError('title cannot be empty');
    }
    if (!isUuid(departmentId)) {
      throw new EntityIdError('departmentId must be a valid UUID');
    }
  }
}

export class CreateJobDTOOutput {
  constructor(
    public title: string,
    public departmentId: string
  ) {}
}

export class UpdateJobDTOInput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly departmentId: string,
  ) {
    if(!isUuid(id)) {
      throw new EntityIdError('id must be a valid UUID');
    }
    if (!title || title.trim() === '') {
      throw new ValidationError('title cannot be empty');
    }
    if (!isUuid(departmentId)) {
      throw new EntityIdError('departmentId must be a valid UUID');
    }
  }
}

export class UpdateJobDTOOutput {
  constructor(
    public id: string,
    public title?: string,
    public departmentId?: string,
  ) {}
}

export class JobStatsDTO {
  constructor(
    public totalJobs: number,
    public activeJobs: number,
    public inactiveJobs: number
  ) {}
}

// ############# View Models #############
export class JobResponseViewModel {
  constructor(
    public id: string,
    public title: string,
    public departmentId: string,
    public departmentName: string | undefined,
    public createdAt: Date,
    public updatedAt: Date,
    public isActive: boolean
  ) {}
}

export class JobStatsViewModel {
  constructor(
    public totalJobs: number,
    public activeJobs: number,
    public inactiveJobs: number
  ) {}
}