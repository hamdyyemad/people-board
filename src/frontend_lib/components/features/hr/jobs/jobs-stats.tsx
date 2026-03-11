import * as React from "react";
import { Card, CardContent } from "@/frontend_lib/components/ui/card";
import { Job } from "@/frontend_lib/data/hr/jobs";

interface JobsStatsProps {
  jobs: Job[];
}

function JobsStatsComponent({ jobs }: JobsStatsProps) {
  // Moving the calculation logic inside the stats component keeps the parent clean
  const activeCount = jobs.filter((j) => j.is_active).length;
  const inactiveCount = jobs.filter((j) => !j.is_active).length;
  const departmentCount = new Set(jobs.map((j) => j.department_id)).size;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Jobs</p>
          <p className="text-3xl font-bold mt-1">{jobs.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{activeCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inactive</p>
          <p className="text-3xl font-bold mt-1 text-muted-foreground">{inactiveCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Departments</p>
          <p className="text-3xl font-bold mt-1">{departmentCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Memoize to prevent re-renders when parent component updates
export const JobsStats = React.memo(JobsStatsComponent);
