"use client";

import * as React from "react";
import { Input } from "@/frontend_lib/components/ui/input";
import { Label } from "@/frontend_lib/components/ui/label";
import { ModalFooter } from "../shared/modal-footer";
import { ModalBodyProps } from "../types";

export interface FormField {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "date" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  options?: { label: string; value: string }[];
}

interface FormModalBodyProps<TData extends Record<string, unknown>>
  extends ModalBodyProps<TData> {
  fields: FormField[];
  operation: "add" | "edit";
  loading?: boolean;
}

/**
 * FormModalBody — shared form renderer for Add and Edit operations.
 * Driven by a `fields` config array — no hardcoded fields.
 * Initialises from `record` when editing, blank when adding.
 */
export function FormModalBody<TData extends Record<string, unknown>>({
  record,
  fields,
  operation,
  onClose,
  onConfirm,
  loading = false,
}: FormModalBodyProps<TData>) {
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      const val = record?.[f.key];
      initial[f.key] =
        val !== undefined && val !== null ? String(val) : "";
    });
    return initial;
  });

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleConfirm() {
    const result: Record<string, unknown> = {};
    fields.forEach((f) => {
      const raw = values[f.key];
      if (f.type === "number") result[f.key] = Number(raw);
      else result[f.key] = raw;
    });
    onConfirm(result as Partial<TData>);
  }

  const isValid = fields
    .filter((f) => f.required)
    .every((f) => values[f.key]?.trim().length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.key}
            className={field.type === "textarea" ? "sm:col-span-2" : ""}
          >
            <Label htmlFor={field.key} className="mb-1.5 block text-sm font-medium">
              {field.label}
              {field.required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>

            {field.type === "select" && field.options ? (
              <select
                id={field.key}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                disabled={field.readOnly}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select {field.label}…</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.key}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            ) : (
              <Input
                id={field.key}
                type={field.type ?? "text"}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
              />
            )}
          </div>
        ))}
      </div>

      <ModalFooter
        onClose={onClose}
        onConfirm={handleConfirm}
        confirmLabel={operation === "add" ? "Create" : "Save changes"}
        loading={loading}
        confirmDisabled={!isValid}
      />
    </div>
  );
}
