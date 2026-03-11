import { CrudModalFactory, useCrudModal } from "@/frontend_lib/components/shared/data-table/crud-modal";
import { EntityConfig } from "./data-view-type";

interface GenericDataModalProps<T> {
  modal: ReturnType<typeof useCrudModal<T>>;
  config: EntityConfig<T>;
}

export default function DataViewAction<T extends object>({ modal, config }: GenericDataModalProps<T>) {
  return (
    <CrudModalFactory<T>
      open={modal.open}
      operation={modal.operation}
      record={modal.record}
      entityName={config.name}
      // formFields={JOB_FORM_FIELDS}
      formFields={config.formFields}
      // getRecordLabel={(job) => job.title}
      getRecordLabel={config.getRecordLabel}
      onClose={modal.closeModal}
      actions={{
        onAdd: config.onAdd,
        // onEdit: (data) => console.log(`Edit ${config.name}:`, data),
        // onDelete: (data) => console.log(`Delete ${config.name}:`, data),
      }}
    />
  );
}