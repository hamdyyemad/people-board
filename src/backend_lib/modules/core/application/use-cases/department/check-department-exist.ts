// Ports
import { IDepartmentRepository } from "../../../domain/ports/repositories/department-repository";

// Exceptions
import { DepartmentNotFoundError } from "../../../domain/exceptions/department-exceptions";

export class CheckDepartmentExistUseCase {
    constructor(
        private readonly departmentRepository: IDepartmentRepository
    ) { }

    async execute(id: string): Promise<boolean> {
        const exist = await this.departmentRepository.existsById(id);

        if (!exist) {
            throw new DepartmentNotFoundError(id);
        }

        return exist;
    }
}