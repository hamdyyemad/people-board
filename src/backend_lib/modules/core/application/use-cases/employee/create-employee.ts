import { IEmployeeRepository } from '../../../domain/ports/repositories/employee-repository';
import { IJobRepository } from '../../../domain/ports/repositories/job-repository';
import { IOfficeRepository } from '../../../domain/ports/repositories/office-repository';
import { ICityRepository } from '../../../domain/ports/repositories/city-repository';
import { IPersonRepository } from '../../../domain/ports/repositories/person-repository';
import { IIdGenerator } from '../../../domain/ports/id-generator';

import { Person } from '../../../domain/entities/person';
import { Employee } from '../../../domain/entities/employee';
import {
  PersonEmail,
  PersonFirstName,
  PersonLastName,
  PersonPhoneNumber,
} from '../../../domain/value-objects/person';

import {
  CreateEmployeeDTOOutput,
  EmployeeResponseViewModel,
  mapEmployeeToViewModel,
} from '../../dto/employee-dto';

import {
  InvalidEmployeeJobError,
  InvalidEmployeeManagerError,
  InvalidEmployeeOfficeError,
  DuplicateActiveEmploymentError,
} from '../../../domain/exceptions/employee-exceptions';
import { InvalidPersonCityError } from '../../../domain/exceptions/person-exceptions';

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export class CreateEmployeeUseCase {
  constructor(
    private readonly employeeRepository: IEmployeeRepository,
    private readonly personRepository: IPersonRepository,
    private readonly jobRepository: IJobRepository,
    private readonly officeRepository: IOfficeRepository,
    private readonly cityRepository: ICityRepository,
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: CreateEmployeeDTOOutput): Promise<EmployeeResponseViewModel> {
    await this.ensureJobExists(input.jobId);
    await this.ensureOfficeExists(input.officeId);
    await this.ensureManagerExists(input.managerId);
    await this.ensureCityExists(input.cityId);
    await this.ensureNoActiveEmployment(input.email, input.phoneNumber);

    const person = new Person(
      this.idGenerator.generate(),
      new PersonFirstName(input.firstName),
      new PersonLastName(input.lastName),
      PersonEmail.fromNullable(input.email),
      PersonPhoneNumber.fromNullable(input.phoneNumber),
      input.cityId
    );

    const employee = new Employee(
      this.idGenerator.generate(),
      person.id,
      null, // employee_no assigned by DB default (employee_no_seq)
      input.jobId,
      input.officeId,
      input.managerId,
      input.status,
      input.type,
      input.recordOrigin,
      parseDateOnly(input.contractStart),
      input.contractEnd ? parseDateOnly(input.contractEnd) : null
    );

    const saved = await this.employeeRepository.createHire(person, employee);
    return mapEmployeeToViewModel(saved);
  }

  private async ensureJobExists(jobId: string): Promise<void> {
    const exists = await this.jobRepository.existsById(jobId);
    if (!exists) throw new InvalidEmployeeJobError(jobId);
  }

  private async ensureOfficeExists(officeId: string): Promise<void> {
    const exists = await this.officeRepository.existsById(officeId);
    if (!exists) throw new InvalidEmployeeOfficeError(officeId);
  }

  private async ensureManagerExists(managerId: string | null): Promise<void> {
    if (!managerId) return;
    const exists = await this.employeeRepository.existsById(managerId);
    if (!exists) throw new InvalidEmployeeManagerError(managerId);
  }

  private async ensureCityExists(cityId: string): Promise<void> {
    const city = await this.cityRepository.findById(cityId);
    if (!city) throw new InvalidPersonCityError(cityId);
  }

  private async ensureNoActiveEmployment(
    email: string | null,
    phoneNumber: string | null
  ): Promise<void> {
    let existingPerson: Person | null = null;

    if (email) {
      existingPerson = await this.personRepository.findByEmail(email);
    } else if (phoneNumber) {
      existingPerson = await this.personRepository.findByPhone(phoneNumber);
    }

    if (!existingPerson) return;

    const hasActive = await this.employeeRepository.hasActiveEmploymentByPersonId(
      existingPerson.id
    );
    if (hasActive) throw new DuplicateActiveEmploymentError();
  }
}
