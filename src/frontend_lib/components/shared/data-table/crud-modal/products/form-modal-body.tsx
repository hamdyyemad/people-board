"use client";

import * as React from "react";
import { Input } from "@/frontend_lib/components/ui/input";
import { Label } from "@/frontend_lib/components/ui/label";
import { Combobox } from "@/frontend_lib/components/ui/combobox";
import { ModalFooter } from "../shared/modal-footer";
import { ModalBodyProps } from "../types";

// ============================================================================
// TYPES
// ============================================================================

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

interface FormController {
  getFieldValue: (key: string) => string;
  setFieldValue: (key: string, value: string) => void;
  subscribeToField: (key: string, listener: () => void) => () => void;
  subscribeToValidity: (listener: () => void) => () => void;
  isValid: () => boolean;
  prepareSubmission: () => Record<string, unknown>;
  reset: (fields: FormField[], record: Record<string, unknown> | null) => void;
}

// ============================================================================
// ORCHESTRATOR (Main Component)
// ============================================================================

/**
 * FormModalBody — Orchestrator component for Add and Edit operations.
 * Coordinates form state management, field rendering, and submission.
 * Driven by a `fields` config array — no hardcoded fields.
 */
export function FormModalBody<TData extends Record<string, unknown>>({
  record,
  fields,
  operation,
  onClose,
  onConfirm,
  loading = false,
}: FormModalBodyProps<TData>) {
  const controller = useFormController(fields, record);

  return (
    <div className="flex flex-col gap-5">
      <FormGrid fields={fields} controller={controller} />

      <FormFooterWrapper
        controller={controller}
        operation={operation}
        onClose={onClose}
        onConfirm={onConfirm}
        loading={loading}
      />
    </div>
  );
}

// ============================================================================
// FORM SUBMISSION LOGIC
// ============================================================================

function createInitialValues(
  fields: FormField[],
  record: Record<string, unknown> | null
) {
  const initial: Record<string, string> = {};

  fields.forEach((field) => {
    const value = record?.[field.key];
    initial[field.key] = value !== undefined && value !== null ? String(value) : "";
  });

  return initial;
}

function hasRequiredValue(value: string) {
  return value.trim().length > 0;
}

function createFormController(
  initialFields: FormField[],
  initialRecord: Record<string, unknown> | null
): FormController {
  let currentFields = initialFields;
  let values = createInitialValues(initialFields, initialRecord);
  let requiredFilled = new Map(
    initialFields
      .filter((field) => field.required)
      .map((field) => [field.key, hasRequiredValue(values[field.key] ?? "")])
  );
  let valid = Array.from(requiredFilled.values()).every(Boolean);

  const fieldListeners = new Map<string, Set<() => void>>();
  const validityListeners = new Set<() => void>();

  const emitField = (key: string) => {
    fieldListeners.get(key)?.forEach((listener) => listener());
  };

  const emitValidity = () => {
    validityListeners.forEach((listener) => listener());
  };

  const recomputeRequired = () => {
    requiredFilled = new Map(
      currentFields
        .filter((field) => field.required)
        .map((field) => [field.key, hasRequiredValue(values[field.key] ?? "")])
    );
    valid = Array.from(requiredFilled.values()).every(Boolean);
  };

  return {
    getFieldValue: (key) => values[key] ?? "",

    setFieldValue: (key, nextValue) => {
      const previousValue = values[key] ?? "";
      if (previousValue === nextValue) return;

      values = {
        ...values,
        [key]: nextValue,
      };

      const field = currentFields.find((item) => item.key === key);
      if (field?.required) {
        const previousFilled = requiredFilled.get(key) ?? false;
        const nextFilled = hasRequiredValue(nextValue);
        requiredFilled.set(key, nextFilled);

        const nextValid = Array.from(requiredFilled.values()).every(Boolean);
        if (previousFilled !== nextFilled || nextValid !== valid) {
          valid = nextValid;
          emitValidity();
        }
      }

      emitField(key);
    },

    subscribeToField: (key, listener) => {
      const listeners = fieldListeners.get(key) ?? new Set<() => void>();
      listeners.add(listener);
      fieldListeners.set(key, listeners);

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          fieldListeners.delete(key);
        }
      };
    },

    subscribeToValidity: (listener) => {
      validityListeners.add(listener);
      return () => {
        validityListeners.delete(listener);
      };
    },

    isValid: () => valid,

    prepareSubmission: () => {
      const result: Record<string, unknown> = {};

      currentFields.forEach((field) => {
        const raw = values[field.key] ?? "";
        result[field.key] = field.type === "number" ? Number(raw) : raw;
      });

      return result;
    },

    reset: (nextFields, nextRecord) => {
      currentFields = nextFields;
      values = createInitialValues(nextFields, nextRecord);
      const previousValid = valid;

      recomputeRequired();

      nextFields.forEach((field) => emitField(field.key));

      if (previousValid !== valid) {
        emitValidity();
      }
    },
  };
}

function useFormController(
  fields: FormField[],
  record: Record<string, unknown> | null
) {
  const controllerRef = React.useRef<FormController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = createFormController(fields, record);
  }

  React.useEffect(() => {
    controllerRef.current?.reset(fields, record);
  }, [fields, record]);

  return controllerRef.current;
}

function useFieldValue(controller: FormController, key: string) {
  return React.useSyncExternalStore(
    React.useCallback(
      (listener: () => void) => controller.subscribeToField(key, listener),
      [controller, key]
    ),
    React.useCallback(() => controller.getFieldValue(key), [controller, key]),
    React.useCallback(() => controller.getFieldValue(key), [controller, key])
  );
}

function useFormValidity(controller: FormController) {
  return React.useSyncExternalStore(
    controller.subscribeToValidity,
    controller.isValid,
    controller.isValid
  );
}

// ============================================================================
// FORM GRID LAYOUT
// ============================================================================

/**
 * FormGrid — Manages the responsive grid layout of form fields.
 * Renders all fields in a 2-column grid (1 column on mobile).
 */
interface FormGridProps<TData extends Record<string, unknown>> {
  fields: FormField[];
  controller: FormController;
}

function FormGrid<TData extends Record<string, unknown>>({
  fields,
  controller,
}: FormGridProps<TData>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <FormFieldRenderer
          key={field.key}
          field={field}
          controller={controller}
        />
      ))}
    </div>
  );
}

// ============================================================================
// FORM FOOTER WRAPPER
// ============================================================================

/**
 * FormFooterWrapper — Wraps ModalFooter with submission logic.
 * Uses useFormSubmission to handle validation and data preparation.
 */
interface FormFooterWrapperProps<TData extends Record<string, unknown>> {
  controller: FormController;
  operation: "add" | "edit";
  onClose: () => void;
  onConfirm: (data: Partial<TData>) => void;
  loading?: boolean;
}

function FormFooterWrapper<TData extends Record<string, unknown>>({
  controller,
  operation,
  onClose,
  onConfirm,
  loading = false,
}: FormFooterWrapperProps<TData>) {
  const isValid = useFormValidity(controller);

  const handleConfirm = React.useCallback(() => {
    onConfirm(controller.prepareSubmission() as Partial<TData>);
  }, [controller, onConfirm]);

  return (
    <ModalFooter
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmLabel={operation === "add" ? "Create" : "Save changes"}
      loading={loading}
      confirmDisabled={!isValid}
    />
  );
}

// ============================================================================
// FIELD RENDERER
// ============================================================================

/**
 * FormFieldRenderer — Renders a single form field with label and input.
 * Handles different field types: text, number, email, date, select, textarea.
 */
interface FormFieldRendererProps {
  field: FormField;
  controller: FormController;
}

function FormFieldRenderer({
  field,
  controller,
}: FormFieldRendererProps) {
  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <FieldLabel label={field.label} required={field.required} fieldKey={field.key} />
      <FieldInput field={field} controller={controller} />
    </div>
  );
}

// ============================================================================
// FIELD LABEL
// ============================================================================

/**
 * FieldLabel — Renders the label for a form field with optional required indicator.
 */
interface FieldLabelProps {
  label: string;
  required?: boolean;
  fieldKey: string;
}

function FieldLabel({ 
  label, 
  required, 
  fieldKey 
}: FieldLabelProps) {
  return (
    <Label htmlFor={fieldKey} className="mb-1.5 block text-sm font-medium">
      {label}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
  );
}

// ============================================================================
// FIELD INPUT
// ============================================================================

/**
 * FieldInput — Renders the appropriate input component based on field type.
 * Supports: select (Combobox), textarea, and standard HTML input types.
 */
interface FieldInputProps {
  field: FormField;
  controller: FormController;
}

function FieldInput({
  field,
  controller,
}: FieldInputProps) {
  const value = useFieldValue(controller, field.key);
  const handleInputChange = React.useCallback(
    (newValue: string) => {
      controller.setFieldValue(field.key, newValue);
    },
    [controller, field.key]
  );

  if (field.type === "select" && field.options) {
    return (
      <Combobox
        value={value}
        onValueChange={handleInputChange}
        options={field.options}
        placeholder={`Select ${field.label}...`}
        searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
        emptyMessage={`No ${field.label.toLowerCase()} found.`}
        disabled={field.readOnly}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        id={field.key}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={field.placeholder}
        readOnly={field.readOnly}
        rows={3}
        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
      />
    );
  }

  return (
    <Input
      id={field.key}
      type={field.type ?? "text"}
      value={value}
      onChange={(e) => handleInputChange(e.target.value)}
      placeholder={field.placeholder}
      readOnly={field.readOnly}
    />
  );
}
