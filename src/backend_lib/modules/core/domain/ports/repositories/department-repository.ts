import { IBaseRepository } from './base-repository';
import { Department } from '../../entities/department';

export interface IDepartmentRepository extends IBaseRepository<Department> {
  /**
   * Find all departments under a specific parent
   */
  findByParentId(parentId: string): Promise<Department[]>;
}