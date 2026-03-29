import { useGenericMutation } from "../config";
import { createDepartment, updateDepartment, deleteDepartment } from "./api";

export const useCreateDepartment = () => {
  return useGenericMutation({
    mutationFn: createDepartment,
    invalidateKeys: [['departments'], ['departments', 'stats']],
  });
};

export const useUpdateDepartment = () => {
  return useGenericMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateDepartment(id, data),
    invalidateKeys: [['departments'], ['departments', 'stats']],
  });
};

export const useDeleteDepartment = () => {
  return useGenericMutation({
    mutationFn: deleteDepartment,
    invalidateKeys: [['departments'], ['departments', 'stats']],
  });
};