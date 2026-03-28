import { FormField } from "../crud-modal";

// types/data-view.ts
export interface EntityConfig<T> {
  name: string;
  description: string;
  formFields: FormField[];
  getRecordLabel: (record: T) => string;
  onAdd?: (data: Partial<T>) => void | Promise<void>;
  // ... any other entity-specific overrides
}