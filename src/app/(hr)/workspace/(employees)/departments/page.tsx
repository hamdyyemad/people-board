"use client";

import * as React from "react";
import { Building2, Users, GitBranch, Calendar } from "lucide-react";
import { type EntityConfig, type CardConfig } from "@/frontend_lib/components/shared/data-table";
import { DepartmentsStats } from "@/frontend_lib/components/features/hr/departments/departments-stats";

import { DEPARTMENTS_DATA, type Department } from "@/frontend_lib/data/hr/departments";
import type { CrudOperation } from "@/frontend_lib/components/shared/data-table/crud-modal";

import { departmentsColumns, makeDepartmentRowActions } from "@/frontend_lib/data/hr/departments-columns";

import DataViewLayout from "@/frontend_lib/components/layouts/hr/data-view-layout";


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
    key: "parent_name",
    label: "Parent Department",
    type: "select",
    options: [
      { label: "None (top-level)", value: "" },
      ...DEPARTMENTS_DATA.filter((d) => !d.parent_id).map((d) => ({
        label: d.name,
        value: d.name,
      })),
    ],
  },
  {
    key: "employee_count",
    label: "Employee Count",
    type: "number",
    placeholder: "0",
  },
];
// ───────────────────────────────────────────────────────────────────────────────────

const IMPORT_COLUMNS = ["name", "parent_name", "employee_count"];

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
  { label: "Parent Department", value: "parent_name" as keyof Department },
];

// Grid card configuration - completely generic!
const gridCardConfig: CardConfig<Department> = {
  icon: Building2,
  iconColor: "bg-primary/10 text-primary",
  title: (dept) => dept.name,
  badges: [
    {
      getValue: (dept) => dept.parent_name || "Top-level",
      getVariant: (dept) => dept.parent_name ? "outline" : "secondary",
      format: (value) => value === "Top-level" ? value : value,
    },
  ],
  fields: [
    {
      icon: Users,
      getValue: (dept) => dept.employee_count,
      format: (count) => `${count} employees`,
    },
  ],
};

// List card configuration - completely generic!
const listCardConfig: CardConfig<Department> = {
  icon: Building2,
  iconColor: "bg-primary/10 text-primary",
  title: (dept) => dept.name,
  subtitle: (dept) => dept.parent_name ? `${dept.parent_name}` : "Top-level department",
  fields: [
    {
      icon: Users,
      getValue: (dept) => dept.employee_count,
    },
    {
      icon: Calendar,
      getValue: (dept) => dept.updated_at,
      format: (date) => new Date(date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    },
  ],
};

function DepartmentsPageComponent() {
  return (
    <DataViewLayout 
      config={DEPARTMENT_CONFIG}
      data={DEPARTMENTS_DATA}
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
      <DepartmentsStats departments={DEPARTMENTS_DATA} />
    </DataViewLayout>
  );
}

DepartmentsPageComponent.displayName = "DepartmentsPage";

export default DepartmentsPageComponent;
