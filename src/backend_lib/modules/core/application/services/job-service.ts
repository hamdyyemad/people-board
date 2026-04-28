// Ports
import { IJobRepository } from "../../domain/ports/repositories/job-repository";
import { IDepartmentRepository } from "../../domain/ports/repositories/department-repository";
import { IIdGenerator } from '../../domain/ports/id-generator';

// Use Cases
import { GetJobByIdUseCase } from "../use-cases/job/get-job-by-id";
import { CheckDepartmentExistUseCase } from './../use-cases/department/check-department-exist';
import { CreateJobUseCase } from "../use-cases/job/create-job";
import { UpdateJobUseCase } from "../use-cases/job/update-job";
import { DeleteJobUseCase } from "../use-cases/job/delete-job";

// DTOs
import { CreateJobDTOInput, CreateJobDTOOutput, JobByIdDTO, UpdateJobDTOInput, UpdateJobDTOOutput } from "../dto/job-dto";

export class JobService {
    constructor(
        private readonly jobRepository: IJobRepository, 
        private readonly departmentRepository: IDepartmentRepository,
        private readonly idGenerator: IIdGenerator
    ){}
    
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
