export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
  
export interface DepartmentStats {
  totalDepartments: number;
  topLevelDepartments: number;
  subDepartments: number;
}