import { NextRequest } from 'next/server';

import { withMiddlewares } from '@/backend_lib/middlewares';
import { employeeService } from '@/backend_lib/modules/core/composition-root';
import { validateRequestBody, validateRequestQueryParams } from '@/backend_lib/shared/validation';
import {
  createEmployeeBodySchema,
  employeeQuerySchema,
  type EmployeeQuery,
} from '@/backend_lib/modules/core/validation/employee-schema';
import { createSuccessResponse } from '@/backend_lib/http/response';

export const GET = withMiddlewares(getEmployees);
async function getEmployees(request: NextRequest) {
  const queryResult = validateRequestQueryParams(request, employeeQuerySchema);
  if ('errorResponse' in queryResult) return queryResult.errorResponse;

  const employees = await employeeService.getEmployees(queryResult.data as EmployeeQuery);

  return createSuccessResponse(request, employees, 200);
}

export const POST = withMiddlewares(createEmployee);
async function createEmployee(request: NextRequest) {
  const result = await validateRequestBody(request, createEmployeeBodySchema);
  if ('errorResponse' in result) return result.errorResponse;

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    cityId,
    jobId,
    officeId,
    managerId,
    status,
    type,
    recordOrigin,
    contractStart,
    contractEnd,
  } = result.data;

  const employee = await employeeService.createEmployee({
    firstName,
    lastName,
    email: email ?? null,
    phoneNumber: phoneNumber ?? null,
    cityId,
    jobId,
    officeId,
    managerId: managerId ?? null,
    status,
    type,
    recordOrigin,
    contractStart,
    contractEnd: contractEnd ?? null,
  });

  return createSuccessResponse(request, employee, 201);
}
