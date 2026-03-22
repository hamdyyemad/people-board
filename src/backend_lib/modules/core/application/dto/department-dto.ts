// ################# DTOs #################
export class CreateDepartmentDTO {
  constructor(
    public name: string,
    public parentId?: string
  ) {}
}

export class UpdateDepartmentDTO {
  constructor(
    public id: string,
    public name?: string,
    public parentId?: string
  ) {}
}

export class DepartmentStatsDTO {
  constructor(
    public totalDepartments: number,
    public topLevelDepartments: number,
    public subDepartments: number
  ) {}
}

// ############# View Models #############
export class DepartmentResponseViewModel {
  constructor(
    public id: string,
    public name: string,
    public parentId: string | null,
    public parentName: string | undefined,
    public createdAt: Date,
    public updatedAt: Date,
    public isActive: boolean
  ) {}
}

export class DepartmentStatsViewModel {
  constructor(
    public totalDepartments: number,
    public topLevelDepartments: number,
    public subDepartments: number
  ) {}
}