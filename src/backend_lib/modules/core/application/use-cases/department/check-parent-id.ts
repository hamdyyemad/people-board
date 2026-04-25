// Ports
import { IDepartmentRepository } from "../../../domain/ports/repositories/department-repository";

// Exceptions
import { DepartmentNotFoundError } from "../../../domain/exceptions/department-exceptions";

export class CheckParentIdUseCase {
    constructor(
        private readonly departmentRepository: IDepartmentRepository
    ) { }

    async execute(id: string): Promise<boolean> {
        if (!id) return true; // If no parentId is provided, we consider it valid (root department)

        const exist = await this.departmentRepository.existsById(id);

        if (!exist) {
            throw new DepartmentNotFoundError(id);
        }

        return exist;
    }
}