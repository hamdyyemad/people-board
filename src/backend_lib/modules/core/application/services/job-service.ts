// Ports
import { IJobRepository } from "../../domain/ports/repositories/job-repository";
import { IDepartmentRepository } from "../../domain/ports/repositories/department-repository";
import { IIdGenerator } from '../../domain/ports/id-generator';

// Use Cases
import { CreateJobUseCase } from "../use-cases/job/create-job";
import { CheckParentIdUseCase } from './../use-cases/department/check-parent-id';
import { UpdateJobUseCase } from "../use-cases/job/update-job";

// DTOs
import { CreateJobDTO, UpdateJobDTO } from "../dto/job-dto";

export class JobService {
    constructor(
        private readonly jobRepository: IJobRepository, 
        private readonly departmentRepository: IDepartmentRepository,
        private readonly idGenerator: IIdGenerator
    ){}
    
    async createJob(input: { title: string; departmentId: string }) {
        // Validation: Ensure the provided departmentId exists before creating a job
        const checkParentId = new CheckParentIdUseCase(this.departmentRepository);
        await checkParentId.execute(input.departmentId);

        const useCase = new CreateJobUseCase(this.jobRepository, this.idGenerator);
        const dto = new CreateJobDTO(input.title, input.departmentId);
        return useCase.execute(dto);
    }
    
    async updateJob(input: { id: string; title?: string; departmentId?: string }) {
        // If departmentId is being updated, validate the new departmentId
        if (input.departmentId) {
            const checkParentId = new CheckParentIdUseCase(this.departmentRepository);
            await checkParentId.execute(input.departmentId);
        }
        
        // Implement the update logic here, similar to createJob but using an UpdateJobUseCase
        const useCase = new UpdateJobUseCase(this.jobRepository);
        const dto = new UpdateJobDTO(input.id, input.title || '', input.departmentId || '');
        return useCase.execute(dto);
    }
}
