// Base Repository
import { IBaseRepository } from './base-repository';

// Domain
import { Job } from '../../entities/job';
import { DepartmentName } from '../../value-objects/department';

// DTOs
import { type ListingQueryInput } from '@/backend_lib/shared/listing/listing-query-builder';

/**
 * Job entity enriched with department name.
 * Used for queries that join with departments.
 */
export type JobWithDepartmentName = Job & { departmentName?: DepartmentName };

export interface IJobRepository extends IBaseRepository<Job> {
  /**
   * Find all jobs that belong to a specific department.
   * Returns jobs with their department name populated via LEFT JOIN.
   * Useful for displaying all positions available within a department.
   * 
   * @param departmentId - The UUID of the department to filter by
   * @returns Array of jobs that belong to the specified department, including department name
   */
  findByDepartmentId(departmentId: string): Promise<JobWithDepartmentName[]>;

  /**
   * Find all jobs with pagination, sorting, and filtering support.
   * Includes LEFT JOIN to departments table for department name.
   * Supports cursor-based pagination for efficient large dataset navigation.
   * 
   * @param params - Optional query parameters for pagination, sorting, and filtering
   * @param isAudit - If true, includes soft-deleted jobs. Default: false
   * @returns Array of jobs (limit+1 for cursor), each with department name if available
   */
  findAll(params?: ListingQueryInput, isAudit?: boolean): Promise<JobWithDepartmentName[]>;

  /**
   * Find a single job by its unique identifier.
   * Overrides base implementation to include LEFT JOIN for department name.
   * Uses projection to return only departmentId and departmentName, not entire department object.
   * 
   * @param id - The UUID of the job to retrieve
   * @param isAudit - If true, includes soft-deleted jobs. Default: false
   * @returns The job with department name, or null if not found
   */
  findById(id: string, isAudit?: boolean): Promise<JobWithDepartmentName | null>;

  /**
   * Count total number of jobs matching the same filters as findAll.
   * Ignores pagination parameters (cursor, limit, sort) and returns total count.
   * Used for displaying total records in paginated UI.
   * 
   * @param params - Optional query parameters for filtering (pagination ignored)
   * @returns Total count of non-deleted jobs matching the filters
   */
  countAll(params?: ListingQueryInput): Promise<number>;
}