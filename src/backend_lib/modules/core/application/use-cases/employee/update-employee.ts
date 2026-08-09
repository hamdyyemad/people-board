import { IEmployeeRepository } from '../../../domain/ports/repositories/employee-repository';
import { IJobRepository } from '../../../domain/ports/repositories/job-repository';
import { IOfficeRepository } from '../../../domain/ports/repositories/office-repository';
import { ICityRepository } from '../../../domain/ports/repositories/city-repository';
import { IPersonRepository } from '../../../domain/ports/repositories/person-repository';

import {
  PersonEmail,
  PersonFirstName,
  PersonLastName,
  PersonPhoneNumber,
} from '../../../domain/value-objects/person';
import { Person } from '../../../domain/entities/person';

import {
  UpdateEmployeeDTOOutput,
  EmployeeResponseViewModel,
  mapEmployeeToViewModel,
} from '../../dto/employee-dto';

import {
  EmployeeNotFoundError,
  InvalidEmployeeHierarchyError,
  InvalidEmployeeJobError,
  InvalidEmployeeManagerError,
  InvalidEmployeeOfficeError,
} from '../../../domain/exceptions/employee-exceptions';
import { DuplicatePersonEmailError, DuplicatePersonPhoneError, InvalidPersonCityError } from '../../../domain/exceptions/person-exceptions';

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export class UpdateEmployeeUseCase {
  constructor(
    private readonly employeeRepository: IEmployeeRepository,
    private readonly personRepository: IPersonRepository,
    private readonly jobRepository: IJobRepository,
    private readonly officeRepository: IOfficeRepository,
    private readonly cityRepository: ICityRepository
  ) {}

  async execute(input: UpdateEmployeeDTOOutput): Promise<EmployeeResponseViewModel> {
    const employee = await this.employeeRepository.findById(input.id);
    if (!employee || employee.deletedAt) {
      throw new EmployeeNotFoundError(input.id);
    }

    const person = await this.personRepository.findById(employee.person_id);
    if (!person) {
      throw new EmployeeNotFoundError(input.id);
    }

    if (input.firstName !== undefined) {
      person.firstName = new PersonFirstName(input.firstName);
    }
    if (input.lastName !== undefined) {
      person.lastName = new PersonLastName(input.lastName);
    }
    if (input.email !== undefined) {
      const newEmail = PersonEmail.fromNullable(input.email);
      if (newEmail?.value !== person.email?.value) {
        if (newEmail) {
          const existing = await this.personRepository.findByEmail(newEmail.value);
          if (existing && existing.id !== person.id) {
            throw new DuplicatePersonEmailError(newEmail.value);
          }
        }
        person.email = newEmail;
      }
    }
    if (input.phoneNumber !== undefined) {
      const newPhone = PersonPhoneNumber.fromNullable(input.phoneNumber);
      if (newPhone?.value !== person.phoneNumber?.value) {
        if (newPhone) {
          const existing = await this.personRepository.findByPhone(newPhone.value);
          if (existing && existing.id !== person.id) {
            throw new DuplicatePersonPhoneError(newPhone.value);
          }
        }
        person.phoneNumber = newPhone;
      }
    }
    if (input.cityId !== undefined) {
      if (input.cityId) {
        const city = await this.cityRepository.findById(input.cityId);
        if (!city) throw new InvalidPersonCityError(input.cityId);
      }
      (person as Person).city_id = input.cityId;
    }

    if (input.jobId !== undefined) {
      const exists = await this.jobRepository.existsById(input.jobId);
      if (!exists) throw new InvalidEmployeeJobError(input.jobId);
      employee.job_id = input.jobId;
    }

    if (input.officeId !== undefined) {
      const exists = await this.officeRepository.existsById(input.officeId);
      if (!exists) throw new InvalidEmployeeOfficeError(input.officeId);
      employee.office_id = input.officeId;
    }

    if (input.managerId !== undefined) {
      if (input.managerId) {
        const exists = await this.employeeRepository.existsById(input.managerId);
        if (!exists) throw new InvalidEmployeeManagerError(input.managerId);
      }
      if (!employee.canHaveManager(input.managerId)) {
        throw new InvalidEmployeeHierarchyError('Employee cannot be their own manager');
      }
      employee.manager_id = input.managerId;
    }

    if (input.status !== undefined) employee.status = input.status;
    if (input.type !== undefined) employee.type = input.type;
    if (input.recordOrigin !== undefined) employee.record_origin = input.recordOrigin;
    if (input.contractStart !== undefined) {
      employee.contract_start = parseDateOnly(input.contractStart);
    }
    if (input.contractEnd !== undefined) {
      employee.contract_end = input.contractEnd ? parseDateOnly(input.contractEnd) : null;
    }

    person.updatedAt = new Date();
    employee.updatedAt = new Date();

    const updated = await this.employeeRepository.updateHire(person, employee);
    return mapEmployeeToViewModel(updated);
  }
}
