// Ports
import { IJobRepository } from "../../../domain/ports/repositories/job-repository";
import { IDepartmentRepository } from "../../../domain/ports/repositories/department-repository";
import { IIdGenerator } from "../../../domain/ports/id-generator";

// Entities & Value Objects
import { JobTitle } from "../../../domain/value-objects/job-title";
import { Job } from "../../../domain/entities/job";

// DTOs
import { CreateJobDTO } from "../../dto/job-dto";

// Exceptions
import { DuplicateJobNameError } from "../../../domain/exceptions/job-exceptions";
import { DepartmentNotFoundError } from "../../../domain/exceptions/department-exceptions";

export class CreateJobUseCase {
    constructor(
        private readonly jobRepository: IJobRepository, 
        private readonly departmentRepository: IDepartmentRepository,
        private readonly idGenerator: IIdGenerator
    ){}

    async execute(input: CreateJobDTO): Promise<Job> {
        // Check for duplicates
        const existing = await this.jobRepository.findByName(input.title);
        if (existing) {
            throw new DuplicateJobNameError(input.title);
        }

        // Check department exists
        const department = await this.departmentRepository.findById(input.departmentId);
        if (!department) {
            throw new DepartmentNotFoundError(input.departmentId);
        }

        // Create domain entity
        const jobTitle = new JobTitle(input.title);       
        const job = new Job(
            this.idGenerator.generate(),
            jobTitle,
            input.departmentId
        );
        
        // Save via repository
        return this.jobRepository.save(job);
    }
}