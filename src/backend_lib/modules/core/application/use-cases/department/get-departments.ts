// Ports
import { IDepartmentRepository } from "../../../domain/ports/repositories/department-repository";

// Entities & Value Objects
import { DepartmentResponseViewModel } from "../../dto/department-dto";

export class GetDepartmentsUseCase {
    constructor(
        private readonly departmentRepository: IDepartmentRepository
    ) {}
    async execute(): Promise<DepartmentResponseViewModel[]> {
        const departments = await this.departmentRepository.findAll();

        const mappedDepartments = departments.map(dept => 
            new DepartmentResponseViewModel(
            dept.id, 
            dept.name.getFormatted(), 
            dept.parentId, 
            (dept as any).parentName,
            dept.createdAt, 
            dept.updatedAt,
            dept.isActive()
        ));

        return mappedDepartments;
    }
}