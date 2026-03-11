"use client";

import { ModalFooter } from "../shared/modal-footer";
import { ModalBodyProps } from "../types";

/**
 * ViewModalBody — renders a read-only key/value grid of the record.
 * Skips internal fields (id, deleted_at) and formats dates automatically.
 */
export function ViewModalBody<TData extends Record<string, unknown>>({
  record,
  onClose,
}: ModalBodyProps<TData>) {
  if (!record) return null;

  const entries = Object.entries(record).filter(
    ([key]) => !["id", "deleted_at", "department_id", "parent_id"].includes(key)
  );

  function formatValue(key: string, value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (
      typeof value === "string" &&
      (key.endsWith("_at") || key.endsWith("_date"))
    ) {
      return new Date(value).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return String(value);
  }

  function formatKey(key: string): string {
    return key
      .replace(/_/g, " ")
      .replace(/\bid\b/gi, "ID")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function isBoolean(key: string, value: unknown): boolean {
    return typeof value === "boolean";
  }

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        {entries.map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1">
            <dt className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {formatKey(key)}
            </dt>
            <dd className="text-sm font-medium text-foreground break-words">
              {isBoolean(key, value) ? (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    value
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {value ? "Yes" : "No"}
                </span>
              ) : (
                formatValue(key, value)
              )}
            </dd>
          </div>
        ))}
      </dl>
      <ModalFooter onClose={onClose} readOnly />
    </div>
  );
}
