// Ports
import { IJobRepository } from "../../../domain/ports/repositories/job-repository";

// Entities & Value Objects
import { JobTitle } from "../../../domain/value-objects/job-title";

// DTOs
import { UpdateJobDTOOutput, JobResponseViewModel } from "../../dto/job-dto";

// Exceptions
import { JobNotFoundError, DuplicateJobNameError } from "../../../domain/exceptions/job-exceptions";

export class UpdateJobUseCase {
    constructor(
        private readonly jobRepository: IJobRepository
    ) {}

    async execute(input: UpdateJobDTOOutput): Promise<JobResponseViewModel> {
        // Fetch existing job
        const existingJob = await this.jobRepository.findById(input.id);
        if (!existingJob) {
            throw new JobNotFoundError(input.id);
        }

        // Update fields if provided
        if (input.title) {
            const newTitle = new JobTitle(input.title); // Validate title using value object

            // Check for duplicate name (excluding the current department)
            const existingByTitle = await this.jobRepository.findByName(newTitle.value);
            if (existingByTitle && existingByTitle.id !== input.id) {
                throw new DuplicateJobNameError(newTitle.value); 
            }

            existingJob.title = newTitle;
        }

        // Update the timestamp
        existingJob.updatedAt = new Date();

        // Save updated job
        const updateDepartment = await this.jobRepository.update(existingJob);

        // Map to response ViewModel
        const mappedJob = new JobResponseViewModel(
            updateDepartment.id,
            updateDepartment.title.value,
            updateDepartment.departmentId,
            undefined, // departmentName can be fetched if needed
            updateDepartment.createdAt,
            updateDepartment.updatedAt,
            updateDepartment.isActive()
        );

        return mappedJob;
    }
}