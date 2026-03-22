"use client";

import * as React from "react";
import { Building2, Calendar } from "lucide-react";
import { type EntityConfig, type CardConfig } from "@/frontend_lib/components/shared/data-table";
import { DepartmentsStats } from "@/frontend_lib/components/features/hr/departments/departments-stats";

import type { CrudOperation } from "@/frontend_lib/components/shared/data-table/crud-modal";

import { departmentsColumns, makeDepartmentRowActions } from "@/frontend_lib/data/hr/departments-columns";

import DataViewLayout from "@/frontend_lib/components/layouts/hr/data-view-layout";

// hooks
import { useDepartments, useDepartmentStats, type Department } from "@/frontend_lib/api/queries/department";

// ── Page Meta ─────────────────────────────────────────────────────────────────────
const DEPARTMENT_CONFIG: EntityConfig<Department> = {
  name: "Department",
  description: "Manage your organizational structure and department hierarchy",
  formFields: [], // We set them in the next block
  getRecordLabel: (dept) => dept.name,
  onAdd: (data) => console.log("Adding department...", data),
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
    key: "parentName",
    label: "Parent Department",
    type: "select",
    // options: [
    //   { label: "None (top-level)", value: "" },
    //   ...DEPARTMENTS_DATA.filter((d) => !d.parentId).map((d) => ({
    //     label: d.name,
    //     value: d.name,
    //   })),
    // ],
  }
];
// ───────────────────────────────────────────────────────────────────────────────────

const IMPORT_COLUMNS = ["name", "parentName"];

// Row action handler - entity-specific logic
const handleDepartmentAction = (operation: CrudOperation, dept: Department) => {
  console.log(`${operation} department:`, dept);
  // TODO: Implement actual logic (API calls, navigation, toasts, etc.)
};

// Row click handler - entity-specific logic
const handleDepartmentClick = (dept: Department) => {
  console.log("View department:", dept);
  // TODO: Implement actual logic (API calls, navigation, dialogs, etc.)
};

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
  const { data: stats, isLoading: isStatsLoading, error: statsError } = useDepartmentStats(); // Custom hook to fetch stats from /api/v1/departments/stats
  return (
    <DataViewLayout 
      isLoading={isLoading}
      error={error}
      config={DEPARTMENT_CONFIG}
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
      rowActions={makeDepartmentRowActions(handleDepartmentAction)}
      gridCard={gridCardConfig}
      listCard={listCardConfig}
      onRowClick={handleDepartmentClick}
      onImport={(rows) => console.log("Imported departments:", rows)}
      filterFields={filterFields}
    >
      <DepartmentsStats stats={stats} isLoading={isStatsLoading} error={statsError} />
    </DataViewLayout>
  );
}

DepartmentsPageComponent.displayName = "DepartmentsPage";

export default DepartmentsPageComponent;
