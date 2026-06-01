// Ports
import { IOfficeRepository } from '../../../domain/ports/repositories/office-repository';

// Entities & Value Objects
import { OfficeName } from '../../../domain/value-objects/office';

// DTOs
import { UpdateOfficeDTOOutput, OfficeResponseViewModel } from '../../dto/office-dto';

// Exceptions
import { DuplicateOfficeNameError, OfficeNotFoundError } from '../../../domain/exceptions/office-exceptions';

export class UpdateOfficeUseCase {
  constructor(private readonly officeRepository: IOfficeRepository) {}

  async execute(input: UpdateOfficeDTOOutput): Promise<OfficeResponseViewModel> {
    // Retrieve existing office
    const office = await this.officeRepository.findById(input.id);
    if (!office) {
      throw new OfficeNotFoundError(input.id);
    }

    // If name is being updated, check for duplicates
    if (input.name !== undefined) {
      const officeName = new OfficeName(input.name);

      // Only check for duplicates if the name is actually changing
      if (officeName.value !== office.name.value) {
        const existing = await this.officeRepository.findByName(officeName.value);
        if (existing && existing.id !== input.id) {
          throw new DuplicateOfficeNameError(officeName.value);
        }
      }

      // Update the name
      office.name = officeName;
    }

    // Update other fields if provided
    if (input.cityId !== undefined) {
      (office as any).city_id = input.cityId;
    }

    if (input.address !== undefined) {
      (office as any).address.value = input.address;
    }

    if (input.latitude !== undefined || input.longitude !== undefined) {
      (office as any).coordinates = {
        latitude: input.latitude ?? office.coordinates.latitude,
        longitude: input.longitude ?? office.coordinates.longitude,
      };
    }

    if (input.isActive !== undefined) {
      (office as any).is_active = input.isActive;
    }

    office.updatedAt = new Date();

    // Save via repository
    const updatedOffice = await this.officeRepository.update(office);

    const mappedOffice = new OfficeResponseViewModel(
      updatedOffice.id,
      updatedOffice.name.getFormatted(),
      updatedOffice.city_id,
      undefined, // cityName not available after update
      undefined, // countryId not available after update
      undefined, // countryName not available after update
      updatedOffice.address.value,
      updatedOffice.coordinates.latitude,
      updatedOffice.coordinates.longitude,
      updatedOffice.isActive(),
      updatedOffice.createdAt,
      updatedOffice.updatedAt
    );

    return mappedOffice;
  }
}
