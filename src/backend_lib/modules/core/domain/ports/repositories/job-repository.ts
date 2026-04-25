import { IBaseRepository } from './base-repository';
import { Job } from '../../entities/job';

export type JobWithDepartmentName = Job & { departmentName?: string };

export interface IJobRepository extends IBaseRepository<Job> {
  /**
   * Find all jobs in a specific department
   */
  findByDepartmentId(departmentId: string): Promise<Job[]>;
}