import { GetDepartmentsStatsUseCase } from './../../../../../../backend_lib/modules/core/application/use-cases/department/get-departments-stats';
import { NextRequest } from 'next/server';

// Middlewares
import { withMiddlewares } from '@/backend_lib/middlewares';

// Services
import { departmentService } from '@/backend_lib/modules/core/composition-root';

// HTTP Response Helpers
import { createSuccessResponse } from '@/backend_lib/http/response';

// ========================================================
// GET /api/v1/departments/stats - Get department statistics
// ========================================================
export const GET = withMiddlewares(getDepartmentStats);
async function getDepartmentStats(request: NextRequest) {
  const stats = await departmentService.getDepartmentsStats();

   return createSuccessResponse(
    request,
    stats,
    200
  );
}