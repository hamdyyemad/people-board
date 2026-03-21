import { eq } from 'drizzle-orm';
import { DrizzleClient } from '../databases/drizzle-client';
import { JobsTable } from '../databases/tables/jobs-table';
import { IJobRepository } from '../../domain/ports/repositories/job-repository';
import { Job } from '../../domain/entities/job';
import { JobTitle } from '../../domain/value-objects/job-title';
import { BaseRepository } from './base-repository';

export class JobRepository extends BaseRepository<Job> implements IJobRepository {
  protected table = JobsTable;

  async findByDepartmentId(departmentId: string): Promise<Job[]> {
    const result = await DrizzleClient
      .select()
      .from(JobsTable)
      .where(eq(JobsTable.departmentId, departmentId));

    return result.map(row => this.toDomain(row));
  }

  // Custom mapping from domain entity to database/persistence format
  protected toPersistence(job: Job): any {
    return {
      id: job.id,
      title: job.title.value,
      departmentId: job.departmentId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      deletedAt: job.deletedAt,
    };
  }

  // Custom mapping from database/persistence format to domain entity
  protected toDomain(row: any): Job {
    return new Job(
      row.id,
      new JobTitle(row.title),
      row.departmentId,
      row.createdAt,
      row.updatedAt,
      row.deletedAt
    );
  }
}
