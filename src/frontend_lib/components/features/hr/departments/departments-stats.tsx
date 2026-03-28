import * as React from "react";
import { StatsCards, type StatsCardConfig } from "@/frontend_lib/components/shared/stats-cards";
import { type DepartmentStats } from "@/frontend_lib/api/department";

interface DepartmentsStatsProps {
  stats?: DepartmentStats;
  isLoading?: boolean;
  error?: Error | null;
}

const DEPARTMENT_STATS_CONFIG: StatsCardConfig[] = [
  {
    key: "totalDepartments",
    label: "Total",
    variant: "primary",
  },
  {
    key: "topLevelDepartments",
    label: "Top-level",
    variant: "primary",
  },
  {
    key: "subDepartments",
    label: "Sub-departments",
    variant: "primary",
  },
];

function DepartmentsStatsComponent({ stats, isLoading = false, error = null }: DepartmentsStatsProps) {
  return (
    <StatsCards
      data={stats}
      config={DEPARTMENT_STATS_CONFIG}
      gridCols={3}
      gap="gap-4"
      isLoading={isLoading}
      error={error}
    />
  );
}

// Memoize to prevent re-renders when parent component updates
export const DepartmentsStats = React.memo(DepartmentsStatsComponent);
