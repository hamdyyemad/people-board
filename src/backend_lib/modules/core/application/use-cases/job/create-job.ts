// Ports
import { IJobRepository } from "../../../domain/ports/repositories/job-repository";
import { IIdGenerator } from "../../../domain/ports/id-generator";

// Entities & Value Objects
import { JobTitle } from "../../../domain/value-objects/job-title";
import { Job } from "../../../domain/entities/job";

// DTOs
import { CreateJobDTOOutput, JobResponseViewModel } from "../../dto/job-dto";

// Exceptions
import { DuplicateJobNameError } from "../../../domain/exceptions/job-exceptions";;

export class CreateJobUseCase {
    constructor(
        private readonly jobRepository: IJobRepository, 
        private readonly idGenerator: IIdGenerator
    ){}

    async execute(input: CreateJobDTOOutput): Promise<JobResponseViewModel> {
        // Create value object (this will also validate the title and normalize it)
        const jobTitle = new JobTitle(input.title);       

        // Check for duplicates
        const existing = await this.jobRepository.findByName(jobTitle.value);
        if (existing) {
            throw new DuplicateJobNameError(jobTitle.value);
        }

        // Create domain entity
        const job = new Job(
            this.idGenerator.generate(),
            jobTitle,
            input.departmentId
        );
                
        // Save via repository
        const savedJob = await this.jobRepository.save(job);

        const mappedJob = new JobResponseViewModel(
            savedJob.id, 
            savedJob.title.getFormatted(), 
            savedJob.departmentId, 
            undefined,
            savedJob.createdAt, 
            savedJob.updatedAt,
            savedJob.isActive()
        );
        
        return mappedJob;
    }
}