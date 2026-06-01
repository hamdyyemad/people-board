// Ports
import { IOfficeRepository } from '../../../domain/ports/repositories/office-repository';

// DTOs
import { OfficeResponseViewModel } from '../../dto/office-dto';

// Exceptions
import { OfficeNotFoundError } from '../../../domain/exceptions/office-exceptions';

export class GetOfficeByIdUseCase {
  constructor(private readonly officeRepository: IOfficeRepository) {}

  async execute(id: string): Promise<OfficeResponseViewModel> {
    const office = await this.officeRepository.findById(id);

    if (!office) {
      throw new OfficeNotFoundError(id);
    }

    return new OfficeResponseViewModel(
      office.id,
      office.name.getFormatted(),
      office.city_id,
      office.cityName ? office.cityName.getFormatted() : undefined,
      office.countryId,
      office.countryName,
      office.address.value,
      office.coordinates.latitude,
      office.coordinates.longitude,
      office.isActive(),
      office.createdAt,
      office.updatedAt
    );
  }
}
