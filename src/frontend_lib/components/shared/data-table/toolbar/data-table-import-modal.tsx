"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/frontend_lib/components/ui/dialog";
import { Button } from "@/frontend_lib/components/ui/button";
import { cn } from "@/frontend_lib/utils/utils";
import { exportToXLSX } from "../utils";

type ImportStep = "upload" | "validate" | "confirm";

interface ValidationResult<TData> {
  valid: TData[];
  errors: { row: number; message: string }[];
}

interface DataTableImportModalProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  /** Column keys that must be present in the uploaded file */
  templateColumns: string[];
  /** Called with the validated rows when user confirms import */
  onImport: (rows: TData[]) => void;
}

const STEPS: { id: ImportStep; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "validate", label: "Validate" },
  { id: "confirm", label: "Confirm" },
];

/**
 * DataTableImportModal — 3-step import flow.
 * Step 1: Download template + upload file
 * Step 2: Validate columns and show errors
 * Step 3: Confirm and import valid rows
 */
export default function DataTableImportModal<TData>({
  open,
  onOpenChange,
  entityName,
  templateColumns,
  onImport,
}: DataTableImportModalProps<TData>) {
  const [step, setStep] = React.useState<ImportStep>("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [validation, setValidation] = React.useState<ValidationResult<TData> | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function reset() {
    setStep("upload");
    setFile(null);
    setValidation(null);
    setIsDragging(false);
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(reset, 300);
  }

  // ── Template download ──────────────────────────────────────────────────────
  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([templateColumns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, entityName);
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityName.toLowerCase()}-template.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── File handling ──────────────────────────────────────────────────────────
  function handleFile(f: File) {
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  async function runValidation() {
    if (!file) return;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

    const errors: { row: number; message: string }[] = [];
    const valid: TData[] = [];

    // Check header columns
    if (rows.length === 0) {
      errors.push({ row: 0, message: "The file is empty." });
    } else {
      const fileKeys = Object.keys(rows[0]);
      const missing = templateColumns.filter((col) => !fileKeys.includes(col));
      if (missing.length > 0) {
        errors.push({
          row: 0,
          message: `Missing required columns: ${missing.join(", ")}`,
        });
      }
    }

    // Row-level validation
    rows.forEach((row, i) => {
      const rowErrors: string[] = [];
      templateColumns.forEach((col) => {
        if (row[col] === "" || row[col] === null || row[col] === undefined) {
          rowErrors.push(`"${col}" is empty`);
        }
      });
      if (rowErrors.length > 0) {
        errors.push({ row: i + 2, message: rowErrors.join("; ") });
      } else {
        valid.push(row as TData);
      }
    });

    setValidation({ valid, errors });
    setStep("validate");
  }

  function handleConfirmImport() {
    if (validation?.valid) {
      onImport(validation.valid);
    }
    handleClose();
  }

  const currentStepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-5 border-b border-border/60">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogHeader>
              <DialogTitle className="pr-8">Import {entityName}s</DialogTitle>
              <DialogDescription>
                Upload a spreadsheet to bulk-import records.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    i < currentStepIdx
                      ? "bg-primary text-primary-foreground"
                      : i === currentStepIdx
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i < currentStepIdx ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    i === currentStepIdx ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mx-2 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 py-4">
          {step === "upload" && (
            <UploadStep
              file={file}
              isDragging={isDragging}
              fileInputRef={fileInputRef}
              templateColumns={templateColumns}
              entityName={entityName}
              onDownloadTemplate={downloadTemplate}
              onFile={handleFile}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            />
          )}
          {step === "validate" && validation && (
            <ValidateStep validation={validation} templateColumns={templateColumns} />
          )}
          {step === "confirm" && validation && (
            <ConfirmStep validation={validation} entityName={entityName} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <Button variant="ghost" onClick={handleClose} className="text-muted-foreground">
            Cancel
          </Button>
          <div className="flex gap-2">
            {step === "validate" && (
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
            )}
            {step === "confirm" && (
              <Button variant="outline" onClick={() => setStep("validate")}>
                Back
              </Button>
            )}
            {step === "upload" && (
              <Button onClick={runValidation} disabled={!file}>
                Validate file
              </Button>
            )}
            {step === "validate" && (
              <Button
                onClick={() => setStep("confirm")}
                disabled={!validation || validation.valid.length === 0}
              >
                Continue
              </Button>
            )}
            {step === "confirm" && (
              <Button onClick={handleConfirmImport}>
                Import {validation?.valid.length} records
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UploadStep({
  file,
  isDragging,
  fileInputRef,
  templateColumns,
  entityName,
  onDownloadTemplate,
  onFile,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  file: File | null;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  templateColumns: string[];
  entityName: string;
  onDownloadTemplate: () => void;
  onFile: (f: File) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Template download */}
      <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-medium">{entityName} Template</p>
            <p className="text-xs text-muted-foreground">
              {templateColumns.length} required columns
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onDownloadTemplate} className="gap-1.5 shrink-0">
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : file
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        {file ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(file.size / 1024).toFixed(1)} KB — click to replace
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Supports .xlsx, .xls, .csv
              </p>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>

      {/* Required columns hint */}
      <div className="rounded-lg bg-muted/50 px-4 py-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Required columns
        </p>
        <div className="flex flex-wrap gap-1.5">
          {templateColumns.map((col) => (
            <span
              key={col}
              className="rounded-md bg-background border border-border px-2 py-0.5 text-xs font-mono text-foreground"
            >
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ValidateStep<TData>({
  validation,
  templateColumns,
}: {
  validation: ValidationResult<TData>;
  templateColumns: string[];
}) {
  const hasErrors = validation.errors.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold">{validation.valid.length}</p>
            <p className="text-xs text-muted-foreground">Valid rows</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            hasErrors
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
          )}>
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold">{validation.errors.length}</p>
            <p className="text-xs text-muted-foreground">Errors</p>
          </div>
        </div>
      </div>

      {/* Errors list */}
      {hasErrors && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {validation.errors.map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs">
                {err.row > 0 && (
                  <span className="font-semibold text-muted-foreground">Row {err.row}: </span>
                )}
                <span className="text-foreground">{err.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasErrors && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            All rows are valid and ready to import.
          </p>
        </div>
      )}
    </div>
  );
}

function ConfirmStep<TData>({
  validation,
  entityName,
}: {
  validation: ValidationResult<TData>;
  entityName: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-6 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileSpreadsheet className="h-7 w-7" />
        </div>
        <div>
          <p className="text-2xl font-bold">{validation.valid.length}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {entityName.toLowerCase()} records will be imported
          </p>
        </div>
      </div>

      {validation.errors.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">{validation.errors.length} rows</span> with errors
            will be skipped.
          </p>
        </div>
      )}
    </div>
  );
}
