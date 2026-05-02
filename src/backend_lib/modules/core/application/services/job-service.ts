// Ports
import { IJobRepository } from "../../domain/ports/repositories/job-repository";
import { IDepartmentRepository } from "../../domain/ports/repositories/department-repository";
import { IIdGenerator } from '../../domain/ports/id-generator';

// Use Cases
import { CheckDepartmentExistUseCase } from './../use-cases/department';
import { 
    GetJobsUseCase,
    GetJobByIdUseCase,
    CreateJobUseCase, 
    UpdateJobUseCase, 
    DeleteJobUseCase 
} from "../use-cases/job";

// DTOs
import { CreateJobDTOInput, CreateJobDTOOutput, JobByIdDTO, UpdateJobDTOInput, UpdateJobDTOOutput } from "../dto/job-dto";
import { JobQuery } from "../../validation/job-schema";
import { ListingQuery } from "@/backend_lib/shared/listing/listing-query-builder";

export class JobService {
    constructor(
        private readonly jobRepository: IJobRepository, 
        private readonly departmentRepository: IDepartmentRepository,
        private readonly idGenerator: IIdGenerator
    ){}
    /**
   * ListingQueryInput goes straight through: route → service → use case → repository.
   * No intermediate mapping needed.
   */
    async getJobs(q: JobQuery) {
        // Early exit: If a specific ID is provided, bypass listing logic
        if(q.id) {
            const job = await this.getJobById(q.id);

            return {
                data: job ? [job] : [],
                nextCursor: null, // Since there's only max 1 result, there is no next page
                prevCursor: null, // Since there's only max 1 result, there is no previous page
                total: job ? 1 : 0 // Include this if your DTO expects a total count
            };
        }
        let builder = new ListingQuery()
            .paginate(q.limit, q.cursor, q.direction)
            .sortFromArrays(q.sortBy, q.sortOrder);

        // Apply filters based on query parameters. The repository will combine them with AND. 
        if (q.departmentId) builder = builder.filter({ field: 'departmentId', op: 'eq', value: q.departmentId });
        if (q.title)        builder = builder.filter({ field: 'title', op: 'contains', value: q.title });

        const useCase = new GetJobsUseCase(this.jobRepository);
        return useCase.execute(builder.build());
    }
    
    async getJobById(id: string) {
        const DTO = new JobByIdDTO(id);

        const useCase = new GetJobByIdUseCase(this.jobRepository);

        return useCase.execute(DTO.id);
    }

    async createJob(input: { title: string; departmentId: string }) {
        const command = new CreateJobDTOInput(input.title, input.departmentId);

        // Validation: Ensure the provided departmentId exists before creating a job
        const checkDepartmentExist = new CheckDepartmentExistUseCase(this.departmentRepository);
        await checkDepartmentExist.execute(command.departmentId);

        const useCase = new CreateJobUseCase(this.jobRepository, this.idGenerator);
        const dto = new CreateJobDTOOutput(command.title, command.departmentId);
        return useCase.execute(dto);
    }
    
    async updateJob(input: { id: string; title: string; departmentId: string }) {
        const command = new UpdateJobDTOInput(input.id, input.title, input.departmentId);

        const checkDepartmentExist = new CheckDepartmentExistUseCase(this.departmentRepository);
        await checkDepartmentExist.execute(command.departmentId);
        
        // Implement the update logic here, similar to createJob but using an UpdateJobUseCase
        const useCase = new UpdateJobUseCase(this.jobRepository);
        const dto = new UpdateJobDTOOutput(command.id, command.title, command.departmentId);
        return useCase.execute(dto);
    }

    async deleteJob(id: string) {
        const DTO = new JobByIdDTO(id);

        const useCase = new DeleteJobUseCase(this.jobRepository);

        return useCase.execute(DTO.id);
    }
}
