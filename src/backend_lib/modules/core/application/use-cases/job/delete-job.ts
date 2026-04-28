// Ports
import { IJobRepository } from '../../../domain/ports/repositories/job-repository';

// Exceptions
import { JobNotFoundError, JobAlreadyDeletedError } from '../../../domain/exceptions/job-exceptions';

export class DeleteJobUseCase {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(id: string): Promise<void> {
    // Verify the Job exists before deletion
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new JobNotFoundError(id);
    }

    // Check if already deleted
    if (job.deletedAt) {
        throw new JobAlreadyDeletedError(job.title.value);
    }

    // Delete parent Job
    await this.jobRepository.delete(id);
  }
}
