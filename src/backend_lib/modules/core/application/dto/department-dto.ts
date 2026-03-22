// src/backend_lib/modules/core/application/dto/department.dto.ts
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