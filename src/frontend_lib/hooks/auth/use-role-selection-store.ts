import { create } from "zustand";

export type UserRole = "HR" | "Employee";

interface RoleSelectionStore {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole | null) => void;
  clearSelectedRole: () => void;
  isRoleSelected: () => boolean;
}

export const useRoleSelectionStore = create<RoleSelectionStore>((set, get) => ({
  selectedRole: null,

  setSelectedRole: (role: UserRole | null) => {
    set({ selectedRole: role });
  },

  clearSelectedRole: () => {
    set({ selectedRole: null });
  },

  isRoleSelected: () => {
    return get().selectedRole !== null;
  },
}));
