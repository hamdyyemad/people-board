// src/backend_lib/modules/core/domain/exceptions/department.exceptions.ts
export class DepartmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Department with ID ${id} not found`);
    this.name = 'DepartmentNotFoundError';
  }
}

export class DuplicateDepartmentNameError extends Error {
  constructor(name: string) {
    super(`Department with name "${name}" already exists`);
    this.name = 'DuplicateDepartmentNameError';
  }
}

export class InvalidDepartmentHierarchyError extends Error {
  constructor(message: string) {
    super(`Invalid department hierarchy: ${message}`);
    this.name = 'InvalidDepartmentHierarchyError';
  }
}