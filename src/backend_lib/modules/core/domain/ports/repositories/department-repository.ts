import type { ListingQueryInput } from '@/backend_lib/shared/listing';
import { IBaseRepository } from './base-repository';
import { Department } from '../../entities/department';
import { DepartmentStatsDTO } from '../../../application/dto/department-dto';

export type DepartmentWithParentName = Department & { parentName?: string };

export interface IDepartmentRepository extends IBaseRepository<Department> {
  findByParentId(parentId: string, isAudit?: boolean): Promise<Department[]>;

  /** Paginated listing with parent name join. Accepts ListingQueryInput directly. */
  findAll(params?: ListingQueryInput, isAudit?: boolean): Promise<DepartmentWithParentName[]>;

  /**
   * COUNT(*) of non-deleted departments matching the same filters as `findAll`.
   * Ignores pagination (cursor / limit / sort) — returns the total matching record count.
   */
  countAll(params?: ListingQueryInput): Promise<number>;

  getStats(): Promise<DepartmentStatsDTO>;
}
