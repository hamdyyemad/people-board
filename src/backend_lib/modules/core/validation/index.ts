export {
  createDepartmentBodySchema,
  type CreateDepartmentBody,
  updateDepartmentBodySchema,
  type UpdateDepartmentBody,
  departmentIdParamSchema,
  type DepartmentIdParam,
  departmentQuerySchema,
  type DepartmentQuery,
} from './department-schema';

export {
  createJobBodySchema,
  type CreateJobBody,
  updateJobBodySchema,
  type UpdateJobBody,
  jobIdParamSchema,
  type JobIdParam,
  jobDepartmentParamSchema,
  type JobDepartmentParam,
  jobQuerySchema,
  type JobQuery,
} from './job-schema';

export {
  createOfficeBodySchema,
  type CreateOfficeBody,
  updateOfficeBodySchema,
  type UpdateOfficeBody,
  officeIdParamSchema,
  type OfficeIdParam,
  officeCityParamSchema,
  type OfficeCityParam,
  officeQuerySchema,
  type OfficeQuery,
} from './office-schema';

export {
  createEmployeeBodySchema,
  type CreateEmployeeBody,
  updateEmployeeBodySchema,
  type UpdateEmployeeBody,
  employeeIdParamSchema,
  type EmployeeIdParam,
  employeeQuerySchema,
  type EmployeeQuery,
} from './employee-schema';
