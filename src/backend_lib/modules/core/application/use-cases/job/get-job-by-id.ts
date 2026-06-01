// Ports
import { IJobRepository } from "../../../domain/ports/repositories/job-repository";

// DTOs
import { JobResponseViewModel } from "../../dto/job-dto";

// Exceptions
import { JobNotFoundError } from "../../../domain/exceptions/job-exceptions";

export class GetJobByIdUseCase {
    constructor(
        private readonly jobRepository: IJobRepository, 
    ){}

    async execute(id: string): Promise<JobResponseViewModel> {
        const job = await this.jobRepository.findById(id);

        if (!job) {
            throw new JobNotFoundError(id);
        }

        const mappedJob = new JobResponseViewModel(
            job.id, 
            job.title.getFormatted(), 
            job.departmentId, 
            job.departmentName ? job.departmentName.getFormatted() : undefined,
            job.createdAt, 
            job.updatedAt,
            job.isActive()
        );
        
        return mappedJob;
    }
}