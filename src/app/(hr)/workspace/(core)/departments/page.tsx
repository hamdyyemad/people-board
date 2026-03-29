"use client";
import * as React from "react";
import { Building2, Calendar } from "lucide-react";

import { 
  type EntityConfig, 
  type CardConfig,
  useCrudModal,
} from "@/frontend_lib/components/shared/data-table";

import { toast } from "sonner";
import { DepartmentsStats } from "@/frontend_lib/components/features/hr/departments/departments-stats";
import { departmentsColumns } from "@/frontend_lib/data/hr/departments-columns";
import DataViewLayout from "@/frontend_lib/components/layouts/hr/data-view-layout";

// hooks
import { 
  useCreateDepartment, 
  useUpdateDepartment,
  useDeleteDepartment,
  useDepartments, 
  useDepartmentStats, 
  type Department 
} from "@/frontend_lib/api/department";

// ── Page Meta ─────────────────────────────────────────────────────────────────────
const DEPARTMENT_CONFIG: EntityConfig<Department> = {
  name: "Department",
  description: "Manage your organizational structure and department hierarchy",
  formFields: [], // We set them in the next block
  getRecordLabel: (dept) => dept.name,
};
// ───────────────────────────────────────────────────────────────────────────────────

// ── Add Action Modal ───────────────────────────────────────────────────────────────
DEPARTMENT_CONFIG.formFields = [
  {
    key: "name",
    label: "Department Name",
    type: "text",
    placeholder: "e.g. Product Design",
    required: true,
  },
  {
    key: "parentId",
    label: "Parent Department",
    type: "select",
    // options: [
    //   { label: "None (top-level)", value: "" },
    //   ...DEPARTMENTS_DATA.filter((d) => !d.parentId).map((d) => ({
    //     label: d.name,
    //     value: d.id,
    //   })),
    // ],
  }
];
// ───────────────────────────────────────────────────────────────────────────────────

const IMPORT_COLUMNS = ["name", "parentName"];

// Filter configuration - entity-specific
const filterFields = [
  { label: "Parent Department", value: "parentName" as keyof Department },
];

// Grid card configuration - completely generic!
const gridCardConfig: CardConfig<Department> = {
  icon: Building2,
  iconColor: "bg-primary/10 text-primary",
  title: (dept) => dept.name,
  badges: [
    {
      getValue: (dept) => dept.parentName || "Top-level",
      getVariant: (dept) => dept.parentName ? "outline" : "secondary",
      format: (value) => value === "Top-level" ? value : value,
    },
  ]
};

// List card configuration - completely generic!
const listCardConfig: CardConfig<Department> = {
  icon: Building2,
  iconColor: "bg-primary/10 text-primary",
  title: (dept) => dept.name,
  subtitle: (dept) => dept.parentName ? `${dept.parentName}` : "Top-level department",
  fields: [
    {
      icon: Calendar,
      getValue: (dept) => dept.updatedAt,
      format: (date) => new Date(date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    },
  ],
};

function DepartmentsPageComponent() {
  const { data: departments, isLoading, error } = useDepartments();
  const { data: stats, isLoading: isStatsLoading, error: statsError } = useDepartmentStats();
  const { mutateAsync: createDepartment, isPending: isCreating } = useCreateDepartment();
  const { mutateAsync: updateDepartment, isPending: isUpdating } = useUpdateDepartment();
  const { mutateAsync: deleteDepartment, isPending: isDeleting } = useDeleteDepartment();
  
  // Modal state management
  const modal = useCrudModal<Department>();
  
  // Memoize the config to prevent re-creating handlers on every render
  const config = React.useMemo(() => ({
    ...DEPARTMENT_CONFIG,
    onAdd: async (data: any) => {
      await createDepartment(data);
      toast.success(`Department "${data.name}" created successfully!`);
    },
    onEdit: async (data: any) => {
      await updateDepartment({ id: data.id, data });
      toast.success(`Department "${data.name}" updated successfully!`);
      modal.closeModal();
    },
    onDelete: async (dept: any) => {
      await deleteDepartment(dept.id);
      toast.success(`Department "${dept.name}" deleted successfully!`);
      modal.closeModal();
    },
    formFields: [
      DEPARTMENT_CONFIG.formFields[0],
      {
        ...DEPARTMENT_CONFIG.formFields[1],
        options: [
          { label: "None (top-level)", value: "" },
          ...(departments?.filter((d) => !d.parentName).map((d) => ({
            label: d.name,
            value: d.id,
          })) || []),
        ],
      },
    ],
  }), [createDepartment, updateDepartment, deleteDepartment, departments, modal.closeModal]);

  // Memoize onImport to prevent re-creating on every render
  const onImportHandler = React.useCallback((rows: any[]) => {
    console.log("Imported departments:", rows);
  }, []);
    
  return (
      <DataViewLayout 
      isLoading={isLoading}
      error={error as Error | null}
      config={config}
      data={departments || []}
      columns={departmentsColumns}
      defaultPageSize={20}
      enableRowSelection
      enableColumnVisibility
      enableExport
      enableImport
      enableViewToggle
      exportFileName="departments"
      importTemplateColumns={IMPORT_COLUMNS}
      gridCard={gridCardConfig}
      listCard={listCardConfig}
      onImport={onImportHandler}
      filterFields={filterFields}
      modal={modal}
      modalLoading={isCreating || isUpdating || isDeleting}
    >
      <DepartmentsStats stats={stats} isLoading={isStatsLoading} error={statsError as Error | null} />
    </DataViewLayout>
  );
}

DepartmentsPageComponent.displayName = "DepartmentsPage";

export default DepartmentsPageComponent;
