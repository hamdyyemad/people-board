// Ports
import { IOfficeRepository } from '../../../domain/ports/repositories/office-repository';
import { ICityRepository } from '../../../domain/ports/repositories/city-repository';
import { IIdGenerator } from '../../../domain/ports/id-generator';

// Entities & Value Objects
import { OfficeName, OfficeAddress, OfficeCoordinates } from '../../../domain/value-objects/office';
import { Office } from '../../../domain/entities/office';

// DTOs
import { CreateOfficeDTOOutput, OfficeResponseViewModel } from '../../dto/office-dto';

// Exceptions
import { 
  DuplicateOfficeNameError, 
  DuplicateOfficeAddressError, 
  DuplicateOfficeCoordinatesError,
  InvalidOfficeCityError 
} from '../../../domain/exceptions/office-exceptions';

export class CreateOfficeUseCase {
  constructor(
    private readonly officeRepository: IOfficeRepository,
    private readonly cityRepository: ICityRepository,
    private readonly idGenerator: IIdGenerator
  ) {}

  // “office” is actually representing a physical branch/location
  // not just an organizational unit.
  // Therefore, we also need to create value objects for address and coordinates.
  async execute(input: CreateOfficeDTOOutput): Promise<OfficeResponseViewModel> {
    await this.ensureAddressIsUnique(input.address ?? null);
    await this.ensureCoordinatesAreUnique(input.latitude ?? null, input.longitude ?? null);

    // 2. Derive office name from city if not provided, and ensure uniqueness
    const officeName = await this.deriveAndEnsureUniqueOfficeName(input);

    // 3. Create domain entity
    const office = new Office(
      this.idGenerator.generate(),
      officeName,
      input.cityId,
      input.address, 
      input.latitude,
      input.longitude,
      true // is_active
    );

    // Save via repository
    const savedOffice = await this.officeRepository.save(office);

    const mappedOffice = new OfficeResponseViewModel(
      savedOffice.id,
      savedOffice.name.getFormatted(),
      savedOffice.city_id,
      undefined, // cityName not available yet
      undefined, // countryName not available yet
      savedOffice.address.value,
      savedOffice.coordinates.latitude,
      savedOffice.coordinates.longitude,
      savedOffice.isActive(),
      savedOffice.createdAt,
      savedOffice.updatedAt
    );

    return mappedOffice;
  }
  
  // --- Private Helper Methods ---
  private async ensureAddressIsUnique(addressInput: string | null): Promise<void> {
    const officeAddress = new OfficeAddress(addressInput);
    if (!officeAddress.value) return;

    const existingOffice = await this.officeRepository.findOfficeByAddress(officeAddress.value);
    if (existingOffice) {
      throw new DuplicateOfficeAddressError(officeAddress.value);
    }
  }

  private async ensureCoordinatesAreUnique(lat: string | null, lng: string | null): Promise<void> {
    const officeCoordinates = new OfficeCoordinates(lat, lng);
    if (!officeCoordinates.latitude || !officeCoordinates.longitude) return;

    const existingOffice = await this.officeRepository.findOfficeByCoordinates(
      officeCoordinates.latitude, 
      officeCoordinates.longitude
    );
    
    if (existingOffice) {
      throw new DuplicateOfficeCoordinatesError(officeCoordinates.latitude, officeCoordinates.longitude);
    }
  }

  /**
   * Derives the office name from the city if not provided in input, then validates uniqueness.
   * Falls back to city name when input.name is empty or not provided.
   * 
   * @param input - The create office DTO containing name and cityId
   * @returns OfficeName value object after validation
   * @throws InvalidOfficeCityError if city doesn't exist
   * @throws DuplicateOfficeNameError if name already exists
   */
  private async deriveAndEnsureUniqueOfficeName(input: CreateOfficeDTOOutput): Promise<OfficeName> {
    let name = input.name?.trim() ?? '';

    if (!name && input.cityId) {
      const city = await this.cityRepository.findCityByIdMinimal(input.cityId);
      if (!city) {
        throw new InvalidOfficeCityError(input.cityId);
      }
      name = city.name;
    }

    const officeName = new OfficeName(name);
    const existing = await this.officeRepository.findByName(officeName.value);
    if (existing) {
      throw new DuplicateOfficeNameError(officeName.value);
    }

    return officeName;
  }
}
