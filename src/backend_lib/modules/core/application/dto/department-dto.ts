import { isUuid } from '@/backend_lib/shared/validation';
import { ValidationError, EntityIdError } from '@/backend_lib/shared/exceptions';
// ################# DTOs #################
export class CreateDepartmentDTOInput {
  constructor(
    public readonly name: string,
    public readonly parentId: string | null 
  ) {
    if (!name || name.trim() === '') {
      throw new ValidationError('name cannot be empty');
    }
    if (parentId && !isUuid(parentId)) {
      throw new EntityIdError('parentId must be a valid UUID');
    }
  }
}

export class CreateDepartmentDTOOutput {
  constructor(
    public name: string,
    public parentId?: string
  ) {}
}

export class UpdateDepartmentDTOInput {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly parentId?: string 
  ) {
    if(!isUuid(id)) {
      throw new EntityIdError('id must be a valid UUID');
    }
    if (name && name.trim() === '') {
      throw new ValidationError('name cannot be empty');
    }
    if (parentId && !isUuid(parentId)) {
      throw new EntityIdError('parentId must be a valid UUID');
    }
  }
}

export class UpdateDepartmentDTOOutput {
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

export class DepartmentByIdDTO {
  constructor(
    public id: string) {
      if(!isUuid(id)) {
        throw new EntityIdError('id must be a valid UUID');
      }
    }
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