import * as React from "react";
import { Card, CardContent } from "@/frontend_lib/components/ui/card";
import { Skeleton } from "@/frontend_lib/components/ui/skeleton";

export interface StatsCardConfig {
  key: string;
  label: string;
  format?: (value: any) => React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

interface StatsCardsProps<T> {
  data?: T;
  config: StatsCardConfig[];
  gridCols?: number;
  gap?: "gap-2" | "gap-3" | "gap-4" | "gap-6" | "gap-8";
  isLoading?: boolean;
  error?: Error | null;
}

const variantColorMap = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-green-600",
  warning: "text-amber-600",
  destructive: "text-red-600",
};

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-9 w-20 mt-1" />
      </CardContent>
    </Card>
  );
}

function ErrorCard() {
  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="pt-5 pb-4">
        <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Error</p>
        <p className="text-sm font-semibold mt-1 text-red-600">Failed to load stats</p>
      </CardContent>
    </Card>
  );
}

function StatsCardsComponent<T extends Record<string, any>>({
  data,
  config,
  gridCols = 3,
  gap = "gap-4",
  isLoading = false,
  error = null,
}: StatsCardsProps<T>) {
  if (config.length === 0) return null;

  const gridClass = `grid grid-cols-2 sm:grid-cols-${gridCols} ${gap}`;

  // Show loading state
  if (isLoading) {
    return (
      <div className={gridClass}>
        {config.map((card) => (
          <SkeletonCard key={card.key} />
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={gridClass}>
        <ErrorCard />
      </div>
    );
  }

  // Show data
  if (!data) {
    return (
      <div className={gridClass}>
        {config.map((card) => (
          <Card key={card.key}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-3xl font-bold mt-1 text-muted-foreground">-</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {config.map((card) => {
        const value = data[card.key];
        const displayValue = card.format ? card.format(value) : value;
        const textColor = variantColorMap[card.variant || "default"];

        return (
          <Card key={card.key}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.label}
              </p>
              <p className={`text-3xl font-bold mt-1 ${card.className || textColor}`}>
                {displayValue}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const StatsCards = React.memo(StatsCardsComponent) as typeof StatsCardsComponent;
