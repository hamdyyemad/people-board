import { useGenericMutation } from "../config";
import { createDepartment } from "./api";

export const useCreateDepartment = () => {
  return useGenericMutation({
    mutationFn: createDepartment,
    invalidateKeys: [['departments'], ['departments', 'stats']],
  });
};