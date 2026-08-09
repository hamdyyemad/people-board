import { IEmployeeRepository } from '../../../domain/ports/repositories/employee-repository';
import { EmployeeResponseViewModel, mapEmployeeToViewModel } from '../../dto/employee-dto';
import { EmployeeNotFoundError } from '../../../domain/exceptions/employee-exceptions';

export class GetEmployeeByIdUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(id: string): Promise<EmployeeResponseViewModel> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new EmployeeNotFoundError(id);
    }
    return mapEmployeeToViewModel(employee);
  }
}
