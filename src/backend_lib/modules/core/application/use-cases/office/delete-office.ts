// Ports
import { IOfficeRepository } from '../../../domain/ports/repositories/office-repository';

// Exceptions
import { OfficeAlreadyDeletedError, OfficeNotFoundError } from '../../../domain/exceptions/office-exceptions';

export class DeleteOfficeUseCase {
  constructor(private readonly officeRepository: IOfficeRepository) {}

  async execute(id: string): Promise<void> {
    const office = await this.officeRepository.findById(id);

    if (!office) {
      throw new OfficeNotFoundError(id);
    }
    
    // Check if already deleted
    if (office.deletedAt) {
        throw new OfficeAlreadyDeletedError(office.name.value);
    }

    await this.officeRepository.delete(id);
  }
}
