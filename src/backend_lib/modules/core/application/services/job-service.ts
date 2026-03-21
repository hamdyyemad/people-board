// Ports
import { IJobRepository } from "../../domain/ports/repositories/job-repository";
import { IDepartmentRepository } from "../../domain/ports/repositories/department-repository";
import { IIdGenerator } from '../../domain/ports/id-generator';

// Use Cases
import { CreateJobUseCase } from "../use-cases/job/create-job";

// DTOs
import { CreateJobDTO } from "../dto/job-dto";

export class JobService {
    constructor(
        private readonly jobRepository: IJobRepository, 
        private readonly departmentRepository: IDepartmentRepository,
        private readonly idGenerator: IIdGenerator
    ){}
    
    async createJob(input: { title: string; departmentId: string }) {
        const useCase = new CreateJobUseCase(this.jobRepository, this.departmentRepository, this.idGenerator);
        const dto = new CreateJobDTO(input.title, input.departmentId);
        return useCase.execute(dto);
    }
}
