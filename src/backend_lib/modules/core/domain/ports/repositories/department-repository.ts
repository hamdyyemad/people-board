// Base Repository
import { IBaseRepository } from './base-repository';

// Domain
import { Department } from '../../entities/department';
import { DepartmentName } from '../../value-objects/department-name';

// DTOs
import type { ListingQueryInput } from '@/backend_lib/shared/listing';
import { DepartmentStatsDTO } from '../../../application/dto/department-dto';

export type DepartmentWithParentName = Department & { parentName?: DepartmentName };

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
