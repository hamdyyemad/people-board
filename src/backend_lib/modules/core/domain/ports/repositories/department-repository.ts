import { Department } from '../../entities/department';

export interface IDepartmentRepository {
  save(department: Department): Promise<Department>;
  findById(id: string): Promise<Department | null>;
  findByName(name: string): Promise<Department | null>;
  findAll(includeDeleted?: boolean): Promise<Department[]>;
  findByParentId(parentId: string): Promise<Department[]>;
  update(department: Department): Promise<Department>;
  delete(id: string): Promise<void>;
}