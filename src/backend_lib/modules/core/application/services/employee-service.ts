import { IEmployeeRepository } from '../../domain/ports/repositories/employee-repository';
import { IJobRepository } from '../../domain/ports/repositories/job-repository';
import { IOfficeRepository } from '../../domain/ports/repositories/office-repository';
import { ICityRepository } from '../../domain/ports/repositories/city-repository';
import { IPersonRepository } from '../../domain/ports/repositories/person-repository';
import { IIdGenerator } from '../../domain/ports/id-generator';

import {
  GetEmployeesUseCase,
  GetEmployeeByIdUseCase,
  CreateEmployeeUseCase,
  UpdateEmployeeUseCase,
  DeleteEmployeeUseCase,
} from '../use-cases/employee';

import {
  CreateEmployeeDTOInput,
  CreateEmployeeDTOOutput,
  EmployeeByIdDTO,
  UpdateEmployeeDTOInput,
  UpdateEmployeeDTOOutput,
} from '../dto/employee-dto';

import { ListingQuery } from '@/backend_lib/shared/listing';
import { EmployeeQuery } from '../../validation';

export class EmployeeService {
  constructor(
    private readonly employeeRepository: IEmployeeRepository,
    private readonly personRepository: IPersonRepository,
    private readonly jobRepository: IJobRepository,
    private readonly officeRepository: IOfficeRepository,
    private readonly cityRepository: ICityRepository,
    private readonly idGenerator: IIdGenerator
  ) {}

  async getEmployees(q: EmployeeQuery) {
    if (q.id) {
      const employee = await this.getEmployeeById(q.id);
      return {
        data: employee ? [employee] : [],
        nextCursor: null,
        prevCursor: null,
        total: employee ? 1 : 0,
      };
    }

    let builder = new ListingQuery()
      .paginate(q.limit, q.cursor, q.direction)
      .sortFromArrays(q.sortBy, q.sortOrder);

    if (q.jobId) builder = builder.filter({ field: 'job_id', op: 'eq', value: q.jobId });
    if (q.officeId) builder = builder.filter({ field: 'office_id', op: 'eq', value: q.officeId });
    if (q.status) builder = builder.filter({ field: 'status', op: 'eq', value: q.status });
    if (q.type) builder = builder.filter({ field: 'type', op: 'eq', value: q.type });
    if (q.employeeNo) builder = builder.filter({ field: 'employee_no', op: 'eq', value: q.employeeNo });
    if (q.email) builder = builder.filter({ field: 'email', op: 'contains', value: q.email });
    if (q.firstName) builder = builder.filter({ field: 'first_name', op: 'contains', value: q.firstName });
    if (q.lastName) builder = builder.filter({ field: 'last_name', op: 'contains', value: q.lastName });

    const useCase = new GetEmployeesUseCase(this.employeeRepository);
    return useCase.execute(builder.build());
  }

  async getEmployeeById(id: string) {
    const dto = new EmployeeByIdDTO(id);
    const useCase = new GetEmployeeByIdUseCase(this.employeeRepository);
    return useCase.execute(dto.id);
  }

  async createEmployee(input: {
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    cityId: string;
    jobId: string;
    officeId: string;
    managerId: string | null;
    status: CreateEmployeeDTOOutput['status'];
    type: CreateEmployeeDTOOutput['type'];
    recordOrigin: CreateEmployeeDTOOutput['recordOrigin'];
    contractStart: string;
    contractEnd: string | null;
  }) {
    const command = new CreateEmployeeDTOInput(
      input.firstName,
      input.lastName,
      input.email,
      input.phoneNumber,
      input.cityId,
      input.jobId,
      input.officeId,
      input.managerId,
      input.status,
      input.type,
      input.recordOrigin,
      input.contractStart,
      input.contractEnd
    );

    const useCase = new CreateEmployeeUseCase(
      this.employeeRepository,
      this.personRepository,
      this.jobRepository,
      this.officeRepository,
      this.cityRepository,
      this.idGenerator
    );

    const dto = new CreateEmployeeDTOOutput(
      command.firstName,
      command.lastName,
      command.email,
      command.phoneNumber,
      command.cityId,
      command.jobId,
      command.officeId,
      command.managerId,
      command.status,
      command.type,
      command.recordOrigin,
      command.contractStart,
      command.contractEnd
    );

    return useCase.execute(dto);
  }

  async updateEmployee(input: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phoneNumber?: string | null;
    cityId?: string | null;
    jobId?: string;
    officeId?: string;
    managerId?: string | null;
    status?: UpdateEmployeeDTOOutput['status'];
    type?: UpdateEmployeeDTOOutput['type'];
    recordOrigin?: UpdateEmployeeDTOOutput['recordOrigin'];
    contractStart?: string;
    contractEnd?: string | null;
  }) {
    const command = new UpdateEmployeeDTOInput(
      input.id,
      input.firstName,
      input.lastName,
      input.email,
      input.phoneNumber,
      input.cityId,
      input.jobId,
      input.officeId,
      input.managerId,
      input.status,
      input.type,
      input.recordOrigin,
      input.contractStart,
      input.contractEnd
    );

    const useCase = new UpdateEmployeeUseCase(
      this.employeeRepository,
      this.personRepository,
      this.jobRepository,
      this.officeRepository,
      this.cityRepository
    );

    const dto = new UpdateEmployeeDTOOutput(
      command.id,
      command.firstName,
      command.lastName,
      command.email,
      command.phoneNumber,
      command.cityId,
      command.jobId,
      command.officeId,
      command.managerId,
      command.status,
      command.type,
      command.recordOrigin,
      command.contractStart,
      command.contractEnd
    );

    return useCase.execute(dto);
  }

  async deleteEmployee(id: string) {
    const dto = new EmployeeByIdDTO(id);
    const useCase = new DeleteEmployeeUseCase(this.employeeRepository);
    return useCase.execute(dto.id);
  }
}
