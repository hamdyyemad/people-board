import { isUuid } from '@/backend_lib/shared/validation';
import { ValidationError, EntityIdError } from '@/backend_lib/shared/exceptions';

// ################# DTOs #################
export class CreateOfficeDTOInput {
  constructor(
    public readonly name: string | undefined,
    public readonly cityId: string,
    public readonly address: string | null,
    public readonly latitude: string | null,
    public readonly longitude: string | null
  ) {
    if (name && name.trim() === '') {
      throw new ValidationError('name cannot be empty');
    }
    if (!isUuid(cityId)) {
      throw new EntityIdError('cityId must be a valid UUID');
    }
  }
}

export class CreateOfficeDTOOutput {
  constructor(
    public name: string | undefined,
    public cityId: string,
    public address: string | null,
    public latitude: string | null,
    public longitude: string | null
  ) {}
}

export class UpdateOfficeDTOInput {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly cityId?: string,
    public readonly address?: string | null,
    public readonly latitude?: string | null,
    public readonly longitude?: string | null,
    public readonly isActive?: boolean
  ) {
    if (!isUuid(id)) {
      throw new EntityIdError('id must be a valid UUID');
    }
    if (name !== undefined && (!name || name.trim() === '')) {
      throw new ValidationError('name cannot be empty');
    }
    if (cityId !== undefined && !isUuid(cityId)) {
      throw new EntityIdError('cityId must be a valid UUID');
    }
  }
}

export class UpdateOfficeDTOOutput {
  constructor(
    public id: string,
    public name?: string,
    public cityId?: string,
    public address?: string | null,
    public latitude?: string | null,
    public longitude?: string | null,
    public isActive?: boolean
  ) {}
}

export class OfficeByIdDTO {
  constructor(public id: string) {
    if (!isUuid(id)) {
      throw new EntityIdError('id must be a valid UUID');
    }
  }
}

export class OfficeStatsDTO {
  constructor(
    public totalOffices: number,
    public activeOffices: number,
    public inactiveOffices: number
  ) {}
}

// ############# View Models #############
export class OfficeResponseViewModel {
  constructor(
    public id: string,
    public name: string,
    public cityId: string,
    public cityName: string | undefined,
    public countryId: string | undefined,
    public countryName: string | undefined,
    public address: string | null,
    public latitude: string | null,
    public longitude: string | null,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export class OfficeStatsViewModel {
  constructor(
    public totalOffices: number,
    public activeOffices: number,
    public inactiveOffices: number
  ) {}
}
