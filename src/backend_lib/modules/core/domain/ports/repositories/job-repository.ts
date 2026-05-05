// Base Repository
import { IBaseRepository } from './base-repository';

// Domain
import { Job } from '../../entities/job';
import { DepartmentName } from '../../value-objects/department';

// DTOs
import { type ListingQueryInput } from '@/backend_lib/shared/listing/listing-query-builder';

export type JobWithDepartmentName = Job & { departmentName?: DepartmentName };

export interface IJobRepository extends IBaseRepository<Job> {
  /**
   * Find all jobs in a specific department
   */
  findByDepartmentId(departmentId: string): Promise<Job[]>;

  /** Paginated listing with department name join. Accepts ListingQueryInput directly. */
  findAll(params?: ListingQueryInput, isAudit?: boolean): Promise<JobWithDepartmentName[]>;

  /**
   * COUNT(*) of non-deleted jobs matching the same filters as `findAll`.
   * Ignores pagination (cursor / limit / sort) — returns the total matching record count.
   */
  countAll(params?: ListingQueryInput): Promise<number>;
}