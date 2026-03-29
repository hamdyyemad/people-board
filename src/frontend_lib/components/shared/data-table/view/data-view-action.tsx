import { CrudModalFactory, useCrudModal } from "@/frontend_lib/components/shared/data-table/crud-modal";
import { EntityConfig } from "./data-view-type";

interface GenericDataModalProps<T> {
  modal: ReturnType<typeof useCrudModal<T>>;
  config: EntityConfig<T>;
  loading?: boolean;
}

export default function DataViewAction<T extends object>({ modal, config, loading = false }: GenericDataModalProps<T>) {
  return (
    <CrudModalFactory<T>
      open={modal.open}
      operation={modal.operation}
      record={modal.record}
      entityName={config.name}
      formFields={config.formFields}
      getRecordLabel={config.getRecordLabel}
      onClose={modal.closeModal}
      loading={loading}
      actions={{
        onAdd: config.onAdd,
        onEdit: config.onEdit,
        onDelete: config.onDelete,
      }}
    />
  );
}