import { IEmployeeRepository } from '../../../domain/ports/repositories/employee-repository';
import {
  EmployeeAlreadyDeletedError,
  EmployeeNotFoundError,
} from '../../../domain/exceptions/employee-exceptions';

export class DeleteEmployeeUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(id: string): Promise<void> {
    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      throw new EmployeeNotFoundError(id);
    }

    if (employee.deletedAt) {
      throw new EmployeeAlreadyDeletedError(id);
    }

    await this.employeeRepository.delete(id);
  }
}
