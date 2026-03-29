"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/frontend_lib/components/ui/dropdown-menu";
import { Badge } from "@/frontend_lib/components/ui/badge";
import { DataTableColumnHeader } from "@/frontend_lib/components/shared/data-table";
import { CrudOperation } from "@/frontend_lib/components/shared/data-table/crud-modal";
import { type Department } from "@/frontend_lib/api/department";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const departmentsColumns: ColumnDef<Department>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department Name" />,
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "parentName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Parent Department" />,
    cell: ({ row }) => {
      const parent = row.getValue("parentName") as string | null;
      return parent ? (
        <Badge variant="outline" className="font-normal">
          {parent}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    },
    filterFn: (row, id, value: string[]) => {
      const val = row.getValue(id) as string | null;
      return value.includes(val ?? "none");
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {formatDate(row.getValue("createdAt"))}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {formatDate(row.getValue("updatedAt"))}
      </span>
    ),
  },
];

export function makeDepartmentRowActions(
  onAction: (op: CrudOperation, row: Department) => void
) {
  return function DepartmentRowActions(row: Department) {
    return (
      <>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAction("view", row); }}>
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAction("edit", row); }}>
          Edit department
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => { e.stopPropagation(); onAction("delete", row); }}
        >
          Delete
        </DropdownMenuItem>
      </>
    );
  };
}
