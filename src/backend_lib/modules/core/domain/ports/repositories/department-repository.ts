// Base Repository
import { IBaseRepository } from './base-repository';

// Domain
import { Department } from '../../entities/department';
import { DepartmentName } from '../../value-objects/department';

// DTOs
import type { ListingQueryInput } from '@/backend_lib/shared/listing';
import { DepartmentStatsDTO } from '../../../application/dto/department-dto';

/**
 * Department entity enriched with parent department name.
 * Used for queries that join with parent departments.
 */
export type DepartmentWithParentName = Department & { parentName?: DepartmentName };

export interface IDepartmentRepository extends IBaseRepository<Department> {
  /**
   * Find all departments under a specific parent department.
   * Returns departments with their parent name populated via LEFT JOIN.
   * 
   * @param parentId - The UUID of the parent department to filter by
   * @param isAudit - If true, includes soft-deleted departments. Default: false
   * @returns Array of departments that belong to the specified parent, including parent name
   */
  findByParentId(parentId: string, isAudit?: boolean): Promise<DepartmentWithParentName[]>;

  /**
   * Find all departments with pagination, sorting, and filtering support.
   * Includes LEFT JOIN to parent department for parent name.
   * Supports cursor-based pagination for efficient large dataset navigation.
   * 
   * @param params - Optional query parameters for pagination, sorting, and filtering
   * @param isAudit - If true, includes soft-deleted departments. Default: false
   * @returns Array of departments (limit+1 for cursor), each with parent name if available
   */
  findAll(params?: ListingQueryInput, isAudit?: boolean): Promise<DepartmentWithParentName[]>;

  /**
   * Find a single department by its unique identifier.
   * Overrides base implementation to include LEFT JOIN for parent name.
   * Uses projection to return only necessary fields.
   * 
   * @param id - The UUID of the department to retrieve
   * @param isAudit - If true, includes soft-deleted departments. Default: false
   * @returns The department with parent name, or null if not found
   */
  findById(id: string, isAudit?: boolean): Promise<DepartmentWithParentName | null>;
  
  /**
   * Count total number of departments matching the same filters as findAll.
   * Ignores pagination parameters (cursor, limit, sort) and returns total count.
   * Used for displaying total records in paginated UI.
   * 
   * @param params - Optional query parameters for filtering (pagination ignored)
   * @returns Total count of non-deleted departments matching the filters
   */
  countAll(params?: ListingQueryInput): Promise<number>;

  /**
   * Get aggregate statistics about departments.
   * Returns counts of total departments, top-level (no parent), and sub-departments.
   * Useful for dashboard metrics and overview displays.
   * 
   * @returns DTO containing department statistics
   */
  getStats(): Promise<DepartmentStatsDTO>;
}
