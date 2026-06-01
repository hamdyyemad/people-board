// Ports
import { IOfficeRepository } from '../../domain/ports/repositories/office-repository';
import { ICityRepository } from '../../domain/ports/repositories/city-repository';
import { IIdGenerator } from '../../domain/ports/id-generator';

// Use Cases
import { 
  GetOfficesUseCase,
  GetOfficeByIdUseCase,
  CreateOfficeUseCase,
  UpdateOfficeUseCase,
  DeleteOfficeUseCase
} from '../use-cases/office';

// DTOs
import { 
  CreateOfficeDTOInput, 
  CreateOfficeDTOOutput, 
  OfficeByIdDTO, 
  UpdateOfficeDTOInput, 
  UpdateOfficeDTOOutput 
} from '../dto/office-dto';
import { ListingQuery } from '@/backend_lib/shared/listing';
import { OfficeQuery } from '../../validation';

export class OfficeService {
  constructor(
    private readonly officeRepository: IOfficeRepository,
    private readonly cityRepository: ICityRepository,
    private readonly idGenerator: IIdGenerator
  ) {}

  /**
   * ListingQueryInput goes straight through: route → service → use case → repository.
   * No intermediate mapping needed.
   */
  async getOffices(q: OfficeQuery) {
    // Early exit: If a specific ID is provided, bypass listing logic
    if (q.id) {
      const office = await this.getOfficeById(q.id);

      return {
        data: office ? [office] : [],
        nextCursor: null, // Since there's only max 1 result, there is no next page
        prevCursor: null, // Since there's only max 1 result, there is no previous page
        total: office ? 1 : 0 // Include this if your DTO expects a total count
      };
    }

    let builder = new ListingQuery()
      .paginate(q.limit, q.cursor, q.direction)
      .sortFromArrays(q.sortBy, q.sortOrder);

    // Apply filters based on query parameters. The repository will combine them with AND. 
    if (q.cityId) builder = builder.filter({ field: 'city_id', op: 'eq', value: q.cityId });
    if (q.countryId) builder = builder.filter({ field: 'country_id', op: 'eq', value: q.countryId });
    if (q.name) builder = builder.filter({ field: 'name', op: 'contains', value: q.name });

    const useCase = new GetOfficesUseCase(this.officeRepository);
    return useCase.execute(builder.build());
  }

  async getOfficeById(id: string) {
    const DTO = new OfficeByIdDTO(id);

    const useCase = new GetOfficeByIdUseCase(this.officeRepository);

    return useCase.execute(DTO.id);
  }

  async createOffice(input: {
    name?: string;
    cityId: string;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
  }) {
    const command = new CreateOfficeDTOInput(
      input.name,
      input.cityId,
      input.address,
      input.latitude,
      input.longitude
    );

    const useCase = new CreateOfficeUseCase(this.officeRepository, this.cityRepository, this.idGenerator);

    const dto = new CreateOfficeDTOOutput(
      command.name,
      command.cityId,
      command.address,
      command.latitude,
      command.longitude
    );

    return useCase.execute(dto);
  }

  async updateOffice(input: { 
    id: string; 
    name?: string; 
    cityId?: string;
    address?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    isActive?: boolean;
  }) {
    const command = new UpdateOfficeDTOInput(
      input.id, 
      input.name, 
      input.cityId,
      input.address,
      input.latitude,
      input.longitude,
      input.isActive
    );

    const useCase = new UpdateOfficeUseCase(this.officeRepository);
    
    const dto = new UpdateOfficeDTOOutput(
      command.id, 
      command.name, 
      command.cityId,
      command.address,
      command.latitude,
      command.longitude,
      command.isActive
    );
    
    return useCase.execute(dto);
  }

  async deleteOffice(id: string) {
    const DTO = new OfficeByIdDTO(id);

    const useCase = new DeleteOfficeUseCase(this.officeRepository);

    return useCase.execute(DTO.id);
  }
}
