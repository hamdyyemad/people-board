import * as React from "react";
import { Card, CardContent } from "@/frontend_lib/components/ui/card";
import { type Department } from "@/frontend_lib/api/queries/department";

interface DepartmentsStatsProps {
  departments: Department[];
}

function DepartmentsStatsComponent({ departments }: DepartmentsStatsProps) {
  // Moving the calculation logic inside the stats component keeps the parent clean
  const topLevel = departments.filter((d) => !d.parentId).length;
  const subDepts = departments.filter((d) => !!d.parentId).length;
  // const totalEmployees = departments.reduce((sum, d) => sum + d.employee_count, 0);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold mt-1">{departments.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top-level</p>
          <p className="text-3xl font-bold mt-1 text-primary">{topLevel}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sub-departments</p>
          <p className="text-3xl font-bold mt-1">{subDepts}</p>
        </CardContent>
      </Card>
      {/* <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Employees</p>
          <p className="text-3xl font-bold mt-1">{totalEmployees.toLocaleString()}</p>
        </CardContent>
      </Card> */}
    </div>
  );
}

// Memoize to prevent re-renders when parent component updates
export const DepartmentsStats = React.memo(DepartmentsStatsComponent);
