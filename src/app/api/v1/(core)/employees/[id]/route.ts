import { NextRequest } from 'next/server';

import { withMiddlewares } from '@/backend_lib/middlewares';
import { employeeService } from '@/backend_lib/modules/core/composition-root';
import {
  employeeIdParamSchema,
  updateEmployeeBodySchema,
} from '@/backend_lib/modules/core/validation/employee-schema';
import { validateRequestBody, validateRouteParams } from '@/backend_lib/shared/validation/validate-request';
import { createSuccessResponse } from '@/backend_lib/http/response';

export const GET = withMiddlewares(getEmployeeById);
async function getEmployeeById(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const paramResult = validateRouteParams(resolvedParams, employeeIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  const employee = await employeeService.getEmployeeById(paramResult.data.id);

  return createSuccessResponse(request, employee, 200);
}

export const PUT = withMiddlewares(updateEmployee);
async function updateEmployee(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const paramResult = validateRouteParams(resolvedParams, employeeIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  const result = await validateRequestBody(request, updateEmployeeBodySchema);
  if ('errorResponse' in result) return result.errorResponse;

  const employee = await employeeService.updateEmployee({
    id: paramResult.data.id,
    ...result.data,
    phoneNumber: result.data.phoneNumber ?? undefined,
    cityId: result.data.cityId ?? undefined,
    managerId: result.data.managerId ?? undefined,
    contractEnd: result.data.contractEnd ?? undefined,
  });

  return createSuccessResponse(request, employee, 200);
}

export const DELETE = withMiddlewares(deleteEmployee);
async function deleteEmployee(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const paramResult = validateRouteParams(resolvedParams, employeeIdParamSchema);
  if ('errorResponse' in paramResult) return paramResult.errorResponse;

  await employeeService.deleteEmployee(paramResult.data.id);

  return createSuccessResponse(request, null, 200);
}
