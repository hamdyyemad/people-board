import * as React from "react";
import { Badge } from "@/frontend_lib/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/frontend_lib/components/ui/card";
import type { CardConfig } from "../types";

// Generic Grid Card Component
export function GenericGridCard<TData>({ row, config }: { row: TData; config: CardConfig<TData> }) {
  const Icon = config.icon;
  const title = config.title(row);
  const subtitle = config.subtitle?.(row);
  
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          {Icon && (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconColor || "bg-primary/10 text-primary"}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          {config.badges && config.badges.length > 0 && (
            <div className="flex gap-1 shrink-0 flex-wrap">
              {config.badges.map((badge, idx) => {
                const value = badge.getValue(row);
                const variant = badge.getVariant?.(row) || "default";
                const formatted = badge.format ? badge.format(value) : String(value);
                return (
                  <Badge key={idx} variant={variant} className="shrink-0">
                    {formatted}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        <h3 className="mt-3 font-semibold text-foreground leading-tight line-clamp-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground line-clamp-1">{subtitle}</p>
        )}
      </CardHeader>
      {config.fields && config.fields.length > 0 && (
        <CardContent className="pt-0 space-y-2">
          {config.fields.map((field, idx) => {
            const value = field.getValue(row);
            const formatted = field.format ? field.format(value) : String(value);
            const FieldIcon = field.icon;
            
            return (
              <div key={idx} className="flex items-center gap-2">
                {FieldIcon && <FieldIcon className="h-3 w-3 text-muted-foreground" />}
                {field.label && (
                  <span className="text-xs text-muted-foreground">{field.label}:</span>
                )}
                <span className="text-xs text-foreground">{formatted}</span>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}

// Generic List Card Component
export function GenericListCard<TData>({ row, config }: { row: TData; config: CardConfig<TData> }) {
  const Icon = config.icon;
  const title = config.title(row);
  const subtitle = config.subtitle?.(row);
  
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
      {Icon && (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconColor || "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
        {config.fields && config.fields.length > 0 && (
          <div className="flex items-center gap-3 mt-1">
            {config.fields.map((field, idx) => {
              const value = field.getValue(row);
              const formatted = field.format ? field.format(value) : String(value);
              const FieldIcon = field.icon;
              
              return (
                <div key={idx} className="flex items-center gap-1">
                  {FieldIcon && <FieldIcon className="h-3 w-3 text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground">{formatted}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {config.badges && config.badges.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          {config.badges.map((badge, idx) => {
            const value = badge.getValue(row);
            const variant = badge.getVariant?.(row) || "default";
            const formatted = badge.format ? badge.format(value) : String(value);
            return (
              <Badge key={idx} variant={variant} className="text-xs">
                {formatted}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
