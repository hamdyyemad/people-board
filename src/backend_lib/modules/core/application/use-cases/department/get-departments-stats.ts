// Ports
import { IDepartmentRepository } from "../../../domain/ports/repositories/department-repository";

// Entities & Value Objects
import { DepartmentStatsViewModel } from "../../dto/department-dto";

export class GetDepartmentsStatsUseCase {
    constructor(
        private readonly departmentRepository: IDepartmentRepository
    ) {}
    
    async execute(): Promise<DepartmentStatsViewModel> {
        const stats = await this.departmentRepository.getStats();

        const mappedStats = new DepartmentStatsViewModel(
            stats.totalDepartments,
            stats.topLevelDepartments,
            stats.subDepartments
        );

        return mappedStats;
    }
}