// ################# DTOs #################
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