import { eq, isNull, and, count, ilike, notInArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { randomUUID } from 'node:crypto';
import { DrizzleClient } from '../../../../shared/infrastructure/databases/drizzle-client';
import { employeesTable } from '../databases/tables/employees-table';
import { employeeStatusHistoryTable } from '../databases/tables/employee-status-history-table';
import { peopleTable } from '../databases/tables/people-table';
import { citiesTable } from '../databases/tables/cities-table';
import { JobsTable } from '../databases/tables/jobs-table';
import { officesTable } from '../databases/tables/offices-table';

import { BaseRepository } from './base-repository';

import {
  IEmployeeRepository,
  type EmployeeWithDetails,
} from '../../domain/ports/repositories/employee-repository';
import { Employee } from '../../domain/entities/employee';
import { Person } from '../../domain/entities/person';
import { EmployeeNo } from '../../domain/value-objects/employee';
import {
  PersonEmail,
  PersonFirstName,
  PersonLastName,
  PersonPhoneNumber,
} from '../../domain/value-objects/person';
import { CityName } from '../../domain/value-objects/city';
import { JobTitle } from '../../domain/value-objects/job';
import { OfficeName } from '../../domain/value-objects/office';
import { normalize } from '../../domain/utils/text-formatting';
import { TERMINAL_EMPLOYEE_STATUSES } from '../../domain/constants/employee';
import { EMPLOYEE_STATUS_HISTORY_SYSTEM_NOTES } from '../../domain/constants/employee-status-history';
import { DuplicateActiveEmploymentError } from '../../domain/exceptions/employee-exceptions';

import type { ListingQueryInput } from '../../../../shared/listing';

import { pgTable, uuid, text } from 'drizzle-orm/pg-core';

const cityAlias = alias(citiesTable, 'person_city');
const countriesTable = pgTable('countries', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
});
const countryAlias = alias(countriesTable, 'person_country');
const jobAlias = alias(JobsTable, 'job');
const officeAlias = alias(officesTable, 'office');

function toDateOnlyString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export class EmployeeRepository extends BaseRepository<Employee> implements IEmployeeRepository {
  protected table = employeesTable;

  protected resolveColumn(field: string): any {
    if (field === 'employeeNo') return employeesTable.employeeNo;
    if (field === 'status') return employeesTable.status;
    if (field === 'type') return employeesTable.type;
    if (field === 'contractStart') return employeesTable.contractStart;
    if (field === 'firstName') return peopleTable.firstName;
    if (field === 'lastName') return peopleTable.lastName;
    if (field === 'email') return peopleTable.email;
    if (field === 'jobTitle') return jobAlias.title;
    if (field === 'officeName') return officeAlias.name;
    return super.resolveColumn(field);
  }

  private get projection() {
    return {
      id: employeesTable.id,
      personId: employeesTable.personId,
      employeeNo: employeesTable.employeeNo,
      jobId: employeesTable.jobId,
      officeId: employeesTable.officeId,
      managerId: employeesTable.managerId,
      status: employeesTable.status,
      type: employeesTable.type,
      recordOrigin: employeesTable.recordOrigin,
      contractStart: employeesTable.contractStart,
      contractEnd: employeesTable.contractEnd,
      createdAt: employeesTable.createdAt,
      updatedAt: employeesTable.updatedAt,
      deletedAt: employeesTable.deletedAt,
      firstName: peopleTable.firstName,
      lastName: peopleTable.lastName,
      email: peopleTable.email,
      phoneNumber: peopleTable.phoneNumber,
      personCityId: peopleTable.cityId,
      cityName: cityAlias.name,
      countryName: countryAlias.name,
      jobTitle: jobAlias.title,
      officeName: officeAlias.name,
    };
  }

  private joinQuery() {
    return DrizzleClient.select(this.projection)
      .from(employeesTable)
      .innerJoin(peopleTable, eq(employeesTable.personId, peopleTable.id))
      .leftJoin(cityAlias, eq(peopleTable.cityId, cityAlias.id))
      .leftJoin(countryAlias, eq(cityAlias.countryId, countryAlias.id))
      .leftJoin(jobAlias, eq(employeesTable.jobId, jobAlias.id))
      .leftJoin(officeAlias, eq(employeesTable.officeId, officeAlias.id));
  }

  async findByName(_name: string, _isAudit: boolean = false): Promise<Employee | null> {
    return null;
  }

  async findByEmployeeNo(employeeNo: number, isAudit: boolean = false): Promise<Employee | null> {
    const whereCondition = !isAudit
      ? and(eq(employeesTable.employeeNo, employeeNo), isNull(employeesTable.deletedAt))
      : eq(employeesTable.employeeNo, employeeNo);

    const result = await DrizzleClient
      .select()
      .from(employeesTable)
      .where(whereCondition)
      .limit(1);

    if (!result.length) return null;
    return this.toDomain(result[0]);
  }

  async findById(id: string, isAudit: boolean = false): Promise<EmployeeWithDetails | null> {
    const whereCondition = !isAudit
      ? and(eq(employeesTable.id, id), isNull(employeesTable.deletedAt))
      : eq(employeesTable.id, id);

    const result = await this.joinQuery().where(whereCondition).limit(1);
    if (!result.length) return null;
    return this.toDomainWithDetails(result[0]);
  }

  async findAll(params?: ListingQueryInput, isAudit: boolean = false): Promise<EmployeeWithDetails[]> {
    if (!params) {
      const result = await this.joinQuery().where(
        isAudit ? undefined : isNull(employeesTable.deletedAt)
      );
      return result.map((row) => this.toDomainWithDetails(row));
    }

    const { where, orderBy, limit } = this.buildListQuery(params, isAudit);

    if (params.filters) {
      for (const f of params.filters) {
        if (f.field === 'job_id' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(employeesTable.jobId, f.value));
        }
        if (f.field === 'office_id' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(employeesTable.officeId, f.value));
        }
        if (f.field === 'status' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(employeesTable.status, f.value));
        }
        if (f.field === 'type' && f.op === 'eq' && typeof f.value === 'string') {
          where.push(eq(employeesTable.type, f.value));
        }
        if (f.field === 'employee_no' && f.op === 'eq' && typeof f.value === 'number') {
          where.push(eq(employeesTable.employeeNo, f.value));
        }
        if (f.field === 'email' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          where.push(ilike(peopleTable.email, `%${normalize(f.value)}%`));
        }
        if (f.field === 'first_name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          where.push(ilike(peopleTable.firstName, `%${normalize(f.value)}%`));
        }
        if (f.field === 'last_name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          where.push(ilike(peopleTable.lastName, `%${normalize(f.value)}%`));
        }
      }
    }

    const result = await this.joinQuery()
      .where(where.length > 0 ? and(...where) : undefined)
      .orderBy(...orderBy)
      .limit(limit);

    return result.map((row) => this.toDomainWithDetails(row));
  }

  async countAll(params?: ListingQueryInput): Promise<number> {
    const conditions = [isNull(employeesTable.deletedAt)];

    if (params?.filters) {
      for (const f of params.filters) {
        if (f.field === 'job_id' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(employeesTable.jobId, f.value));
        }
        if (f.field === 'office_id' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(employeesTable.officeId, f.value));
        }
        if (f.field === 'status' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(employeesTable.status, f.value));
        }
        if (f.field === 'type' && f.op === 'eq' && typeof f.value === 'string') {
          conditions.push(eq(employeesTable.type, f.value));
        }
        if (f.field === 'employee_no' && f.op === 'eq' && typeof f.value === 'number') {
          conditions.push(eq(employeesTable.employeeNo, f.value));
        }
        if (f.field === 'email' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          conditions.push(ilike(peopleTable.email, `%${normalize(f.value)}%`));
        }
        if (f.field === 'first_name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          conditions.push(ilike(peopleTable.firstName, `%${normalize(f.value)}%`));
        }
        if (f.field === 'last_name' && f.op === 'contains' && typeof f.value === 'string' && f.value.length > 0) {
          conditions.push(ilike(peopleTable.lastName, `%${normalize(f.value)}%`));
        }
      }
    }

    const needsPeopleJoin = params?.filters?.some(
      (f) => f.field === 'email' || f.field === 'first_name' || f.field === 'last_name'
    );

    const query = DrizzleClient.select({ total: count() }).from(employeesTable);

    if (needsPeopleJoin) {
      const result = await query
        .innerJoin(peopleTable, eq(employeesTable.personId, peopleTable.id))
        .where(and(...conditions));
      return result[0]?.total ?? 0;
    }

    const result = await query.where(and(...conditions));
    return result[0]?.total ?? 0;
  }

  async hasActiveEmploymentByPersonId(personId: string): Promise<boolean> {
    const result = await DrizzleClient
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.personId, personId),
          isNull(employeesTable.deletedAt),
          notInArray(employeesTable.status, [...TERMINAL_EMPLOYEE_STATUSES])
        )
      )
      .limit(1);

    return result.length > 0;
  }

  async createHire(person: Person, employee: Employee): Promise<EmployeeWithDetails> {
    let personId = person.id;

    await DrizzleClient.transaction(async (tx) => {
      let existingId: string | null = null;

      if (person.email) {
        const byEmail = await tx
          .select({ id: peopleTable.id })
          .from(peopleTable)
          .where(and(eq(peopleTable.email, person.email.value), isNull(peopleTable.deletedAt)))
          .limit(1);
        if (byEmail.length) {
          existingId = byEmail[0].id;
        }
      }

      if (!existingId && person.phoneNumber) {
        const byPhone = await tx
          .select({ id: peopleTable.id })
          .from(peopleTable)
          .where(
            and(eq(peopleTable.phoneNumber, person.phoneNumber.value), isNull(peopleTable.deletedAt))
          )
          .limit(1);
        if (byPhone.length) {
          existingId = byPhone[0].id;
        }
      }

      const personRow = this.personToPersistence(person);

      if (existingId) {
        personId = existingId;
        await tx
          .update(peopleTable)
          .set({
            firstName: personRow.firstName,
            lastName: personRow.lastName,
            email: personRow.email,
            phoneNumber: personRow.phoneNumber,
            cityId: personRow.cityId,
            updatedAt: new Date(),
          })
          .where(eq(peopleTable.id, personId));
      } else {
        await tx.insert(peopleTable).values(personRow);
      }

      employee.person_id = personId;

      const activeEmployment = await tx
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            eq(employeesTable.personId, personId),
            isNull(employeesTable.deletedAt),
            notInArray(employeesTable.status, [...TERMINAL_EMPLOYEE_STATUSES])
          )
        )
        .limit(1);

      if (activeEmployment.length > 0) {
        throw new DuplicateActiveEmploymentError();
      }

      await tx.insert(employeesTable).values(this.toInsertPersistence(employee));

      await tx.insert(employeeStatusHistoryTable).values({
        id: randomUUID(),
        employeeId: employee.id,
        oldStatus: null,
        newStatus: employee.status,
        changedBy: null,
        manualNote: null,
        systemNote: EMPLOYEE_STATUS_HISTORY_SYSTEM_NOTES.INITIAL_HIRE,
      });
    });

    const created = await this.findById(employee.id);
    if (!created) {
      throw new Error('Failed to load employee after create');
    }
    return created;
  }

  async updateHire(person: Person, employee: Employee): Promise<EmployeeWithDetails> {
    await DrizzleClient.transaction(async (tx) => {
      const personRow = this.personToPersistence(person);

      await tx
        .update(peopleTable)
        .set({
          firstName: personRow.firstName,
          lastName: personRow.lastName,
          email: personRow.email,
          phoneNumber: personRow.phoneNumber,
          cityId: personRow.cityId,
          updatedAt: new Date(),
        })
        .where(eq(peopleTable.id, person.id));

      await tx
        .update(employeesTable)
        .set(this.toPersistence(employee))
        .where(eq(employeesTable.id, employee.id));
    });

    const updated = await this.findById(employee.id);
    if (!updated) {
      throw new Error('Failed to load employee after update');
    }
    return updated;
  }

  private personToPersistence(person: Person) {
    return {
      id: person.id,
      firstName: person.firstName.value,
      lastName: person.lastName.value,
      email: person.email?.value ?? null,
      phoneNumber: person.phoneNumber?.value ?? null,
      cityId: person.city_id,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
      deletedAt: person.deletedAt,
    };
  }

  protected toPersistence(employee: Employee): any {
    return {
      id: employee.id,
      personId: employee.person_id,
      employeeNo: employee.employee_no?.value ?? null,
      jobId: employee.job_id,
      officeId: employee.office_id,
      managerId: employee.manager_id,
      status: employee.status,
      type: employee.type,
      recordOrigin: employee.record_origin,
      contractStart: toDateOnlyString(employee.contract_start),
      contractEnd: employee.contract_end ? toDateOnlyString(employee.contract_end) : null,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      deletedAt: employee.deletedAt,
    };
  }

  /** Omits employee_no so PostgreSQL applies the column DEFAULT (employee_no_seq). */
  private toInsertPersistence(employee: Employee) {
    const { employeeNo: _omit, ...row } = this.toPersistence(employee);
    return row;
  }

  protected toDomain(row: any): Employee {
    return new Employee(
      row.id,
      row.personId,
      EmployeeNo.fromNullable(row.employeeNo),
      row.jobId,
      row.officeId,
      row.managerId ?? null,
      row.status,
      row.type,
      row.recordOrigin,
      parseDateOnly(row.contractStart),
      row.contractEnd ? parseDateOnly(row.contractEnd) : null,
      row.createdAt,
      row.updatedAt,
      row.deletedAt ?? null
    );
  }

  private toDomainWithDetails(row: any): EmployeeWithDetails {
    const employee = this.toDomain(row);
    return Object.assign(employee, {
      firstName: row.firstName ? PersonFirstName.fromDatabase(row.firstName) : undefined,
      lastName: row.lastName ? PersonLastName.fromDatabase(row.lastName) : undefined,
      email: row.email ? PersonEmail.fromDatabase(row.email) : null,
      phoneNumber: PersonPhoneNumber.fromNullable(row.phoneNumber),
      personCityId: row.personCityId ?? null,
      cityName: row.cityName ? CityName.fromDatabase(row.cityName) : undefined,
      countryName: row.countryName ?? undefined,
      jobTitle: row.jobTitle ? JobTitle.fromDatabase(row.jobTitle) : undefined,
      officeName: row.officeName ? OfficeName.fromDatabase(row.officeName) : undefined,
    }) as EmployeeWithDetails;
  }
}
