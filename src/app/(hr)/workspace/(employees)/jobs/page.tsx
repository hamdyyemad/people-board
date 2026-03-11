"use client";

import * as React from "react";
import { Briefcase, Building2, Calendar } from "lucide-react";
import { type EntityConfig, type CardConfig } from "@/frontend_lib/components/shared/data-table";
import { JobsStats } from "@/frontend_lib/components/features/hr/jobs/jobs-stats";

import { JOBS_DATA, type Job } from "@/frontend_lib/data/hr/jobs";
import { DEPARTMENTS_DATA } from "@/frontend_lib/data/hr/departments";
import type { CrudOperation } from "@/frontend_lib/components/shared/data-table/crud-modal";

import { jobsColumns, makeJobRowActions } from "@/frontend_lib/data/hr/jobs-columns";

import DataViewLayout from "@/frontend_lib/components/layouts/hr/data-view-layout";


// ── Page Meta ─────────────────────────────────────────────────────────────────────
const JOB_CONFIG: EntityConfig<Job> = {
  name: "Job",
  description: "Manage job titles and their department assignments",
  formFields: [], // We set them in the next block
  getRecordLabel: (job) => job.title,
  onAdd: (data) => console.log("Adding job...", data),
};
// ───────────────────────────────────────────────────────────────────────────────────

// ── Add Action Modal ───────────────────────────────────────────────────────────────
JOB_CONFIG.formFields = [
  {
    key: "title",
    label: "Job Title",
    type: "text",
    placeholder: "e.g. Senior Frontend Engineer",
    required: true,
  },
  {
    key: "department_name",
    label: "Department",
    type: "select",
    required: true,
    options: DEPARTMENTS_DATA.map((d) => ({ label: d.name, value: d.name })),
  },
  {
    key: "is_active",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];
// ───────────────────────────────────────────────────────────────────────────────────

const IMPORT_COLUMNS = ["title", "department_name", "is_active"];

// Row action handler - entity-specific logic
const handleJobAction = (operation: CrudOperation, job: Job) => {
  console.log(`${operation} job:`, job);
  // TODO: Implement actual logic (API calls, navigation, toasts, etc.)
};

// Row click handler - entity-specific logic
const handleJobClick = (job: Job) => {
  console.log("View job:", job);
  // TODO: Implement actual logic (API calls, navigation, dialogs, etc.)
};

// Filter configuration - entity-specific
const filterFields = [
  { label: "Department", value: "department_name" as keyof Job },
  { label: "Status", value: "is_active" as keyof Job },
];

// Grid card configuration - completely generic!
const gridCardConfig: CardConfig<Job> = {
  icon: Briefcase,
  iconColor: "bg-primary/10 text-primary",
  title: (job) => job.title,
  badges: [
    {
      getValue: (job) => job.is_active,
      getVariant: (job) => job.is_active ? "success" : "muted",
      format: (value) => value ? "Active" : "Inactive",
    },
    {
      getValue: (job) => job.department_name,
      getVariant: () => "secondary",
    },
  ],
  fields: [
    {
      label: "Updated",
      getValue: (job) => job.updated_at,
      format: (date) => new Date(date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    },
  ],
};

// List card configuration - completely generic!
const listCardConfig: CardConfig<Job> = {
  icon: Briefcase,
  iconColor: "bg-primary/10 text-primary",
  title: (job) => job.title,
  subtitle: (job) => job.department_name,
  badges: [
    {
      getValue: (job) => job.is_active,
      getVariant: (job) => job.is_active ? "success" : "muted",
      format: (value) => value ? "Active" : "Inactive",
    },
  ],
  fields: [
    {
      icon: Calendar,
      getValue: (job) => job.updated_at,
      format: (date) => new Date(date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    },
  ],
};

function JobsPageComponent() {
  return (
    <DataViewLayout 
      config={JOB_CONFIG}
      data={JOBS_DATA}
      columns={jobsColumns}
      defaultPageSize={20}
      enableRowSelection
      enableColumnVisibility
      enableExport
      enableImport
      enableViewToggle
      exportFileName="jobs"
      importTemplateColumns={IMPORT_COLUMNS}
      rowActions={makeJobRowActions(handleJobAction)}
      gridCard={gridCardConfig}
      listCard={listCardConfig}
      onRowClick={handleJobClick}
      onImport={(rows) => console.log("Imported jobs:", rows)}
      filterFields={filterFields}
    >
      <JobsStats jobs={JOBS_DATA} />
    </DataViewLayout>
  );
}

JobsPageComponent.displayName = "JobsPage";

export default JobsPageComponent;
