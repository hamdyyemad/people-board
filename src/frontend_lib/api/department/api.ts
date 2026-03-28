// types
import { Department, DepartmentStats } from './types';
import { handleResponse } from '../config';

/*************** Queries ***************/
export const fetchDepartments = async (): Promise<Department[]> => {
  const res = await fetch('/api/v1/departments');
  const data = await handleResponse<{ data: Department[] }>(res);
  return data.data;
};

export const fetchDepartmentStats = async (): Promise<DepartmentStats> => {
  const res = await fetch('/api/v1/departments/stats');
  const data = await handleResponse<{ data: DepartmentStats }>(res);
  return data.data;
};

export const fetchDepartmentById = async (id: string): Promise<Department | undefined> => {
  const res = await fetch(`/api/v1/departments/${id}`);
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};


/*************** Mutations ***************/
export const createDepartment = async (payload: Partial<Department>): Promise<Department> => {
  const res = await fetch('/api/v1/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};

export const updateDepartment = async (id: string, payload: Partial<Department>): Promise<Department> => {
  const res = await fetch(`/api/v1/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};

export const deleteDepartment = async (id: string): Promise<Department> => {
  const res = await fetch(`/api/v1/departments/${id}`, {
    method: 'DELETE',
  });
  const data = await handleResponse<{ data: Department }>(res);
  return data.data;
};