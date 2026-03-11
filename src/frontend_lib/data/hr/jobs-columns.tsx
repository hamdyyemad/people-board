"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/frontend_lib/components/ui/dropdown-menu";
import { Badge } from "@/frontend_lib/components/ui/badge";
import { DataTableColumnHeader } from "@/frontend_lib/components/shared/data-table";
import { CrudOperation } from "@/frontend_lib/components/shared/data-table/crud-modal";
import { Job } from "./jobs";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const jobsColumns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Job Title" />,
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "department_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal">
        {row.getValue("department_name")}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const active = row.getValue("is_active") as boolean;
      return (
        <Badge variant={active ? "success" : "muted"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value: string[]) =>
      value.includes(String(row.getValue(id))),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {formatDate(row.getValue("created_at"))}
      </span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {formatDate(row.getValue("updated_at"))}
      </span>
    ),
  },
];

export function makeJobRowActions(onAction: (op: CrudOperation, row: Job) => void) {
  return function JobRowActions(row: Job) {
    return (
      <>
        <DropdownMenuItem onClick={() => onAction("view", row)}>
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("edit", row)}>
          Edit job
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAction("edit", row)}>
          {row.is_active ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onAction("delete", row)}
        >
          Delete
        </DropdownMenuItem>
      </>
    );
  };
}
