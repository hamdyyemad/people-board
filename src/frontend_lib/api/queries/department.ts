import { useQuery } from '@tanstack/react-query';

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const fetchDepartments = async (): Promise<Department[]> => {
  // In production, replace this with actual fetch:
  const res = await fetch('/api/v1/departments');
  const data = await res.json(); 
  console.log("Fetched department data:", data); // Debug log
  return data.data;
};

const fetchDepartment = async (id: string): Promise<Department | undefined> => {
  const res = await fetch(`/api/v1/departments/${id}`);
  const data = await res.json(); 
  console.log("Fetched department data:", data); // Debug log
  return data.data;
  
};


export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};


export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: async () => {
      return fetchDepartment(id);
    },
  });
};