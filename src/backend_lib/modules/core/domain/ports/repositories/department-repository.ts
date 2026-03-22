import { IBaseRepository } from './base-repository';
import { Department } from '../../entities/department';
import { DepartmentStatsDTO } from '../../../application/dto/department-dto';

export interface IDepartmentRepository extends IBaseRepository<Department> {
  /**
   * Find all departments under a specific parent
   */
  findByParentId(parentId: string, isAudit?: boolean): Promise<Department[]>;

  /**
   * Get statistics for all departments
   */
  getStats(): Promise<DepartmentStatsDTO>;
}