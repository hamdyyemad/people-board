// Ports
import { IDepartmentRepository } from "../../../domain/ports/repositories/department-repository";

// Entities & Value Objects
import { DepartmentResponseViewModel } from "../../dto/department-dto";

// Exceptions
import { DepartmentNotFoundError } from "../../../domain/exceptions/department-exceptions";

export class GetDepartmentByIdUseCase {
    constructor(
        private readonly departmentRepository: IDepartmentRepository
    ) {}

    async execute(id: string): Promise<DepartmentResponseViewModel> {
        const department = await this.departmentRepository.findById(id);
        if(!department) {
            throw new DepartmentNotFoundError(id);
        }

        const mappedDepartment = new DepartmentResponseViewModel(
            department.id, 
            department.name.getFormatted(), 
            department.parentId, 
            department.createdAt, 
            department.updatedAt,
            department.isActive()
        );
        
        return mappedDepartment;
    }
}