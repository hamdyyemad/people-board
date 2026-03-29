"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogPortal,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/frontend_lib/components/ui/dialog";
import { cn } from "@/frontend_lib/utils/utils";
import { X } from "lucide-react";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional icon shown in the header area */
  icon?: React.ReactNode;
  /** Optional element shown in the top-right of the header (e.g. step indicator) */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const sizeMap: Record<NonNullable<ModalShellProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

// ============================================================================
// ORCHESTRATOR (Main Component)
// ============================================================================

/**
 * ModalShell — Orchestrator for CRUD dialog flows.
 * 
 * Coordinates modal behavior, accessibility, and layout.
 * Uses `modal={false}` to allow interactions with portaled Radix components
 * (Popovers, Select, Combobox) while maintaining a custom backdrop.
 */
export function ModalShell({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  icon,
  headerAction,
  children,
  className,
}: ModalShellProps) {
  useBodyScrollLock(open);

  const eventHandlers = useEventSuppression();

  return (
    <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <ModalBackdrop open={open} onClose={() => onOpenChange(false)} />
        
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-border/50 bg-background p-0 shadow-2xl duration-200 rounded-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            sizeMap[size],
            "max-h-[min(90vh,calc(100vh-2rem))] overflow-y-auto overflow-x-hidden",
            className
          )}
          onInteractOutside={eventHandlers.suppressOutsideDismiss}
          onPointerDownOutside={eventHandlers.suppressPointerOutside}
          onFocusOutside={eventHandlers.suppressFocusOutside}
        >
          <ModalHeader
            title={title}
            description={description}
            icon={icon}
            headerAction={headerAction}
          />

          <ModalBody>{children}</ModalBody>

          <CloseButton />
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

// ============================================================================
// BODY SCROLL LOCK
// ============================================================================

/**
 * useBodyScrollLock — Prevents body scroll when modal is open.
 * Restores previous overflow value when closed.
 */
function useBodyScrollLock(isOpen: boolean) {
  React.useEffect(() => {
    if (!isOpen) return;
    
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);
}

// ============================================================================
// EVENT SUPPRESSION
// ============================================================================

/**
 * useEventSuppression — Provides event handlers to prevent modal dismissal
 * when interacting with portaled overlays (Radix Popover, Select, Command).
 */
function useEventSuppression() {
  const suppressOutsideDismiss = React.useCallback<
    NonNullable<React.ComponentProps<typeof DialogPrimitive.Content>["onInteractOutside"]>
  >((event) => {
    if (isEventFromPortaledOverlay(event.target)) {
      event.preventDefault();
    }
  }, []);

  const suppressPointerOutside = React.useCallback<
    NonNullable<React.ComponentProps<typeof DialogPrimitive.Content>["onPointerDownOutside"]>
  >((event) => {
    if (isEventFromPortaledOverlay(event.detail.originalEvent.target)) {
      event.preventDefault();
    }
  }, []);

  const suppressFocusOutside = React.useCallback<
    NonNullable<React.ComponentProps<typeof DialogPrimitive.Content>["onFocusOutside"]>
  >((event) => {
    if (isEventFromPortaledOverlay(event.target)) {
      event.preventDefault();
    }
  }, []);

  return {
    suppressOutsideDismiss,
    suppressPointerOutside,
    suppressFocusOutside,
  };
}

/**
 * isEventFromPortaledOverlay — Checks if event originated from a Radix portal.
 * Prevents accidental modal dismissal when clicking on overlays.
 */
function isEventFromPortaledOverlay(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("[data-radix-popper-content-wrapper]") ||
      target.closest("[data-radix-select-content]") ||
      target.closest("[cmdk-root]")
  );
}

// ============================================================================
// MODAL BACKDROP
// ============================================================================

/**
 * ModalBackdrop — Custom backdrop overlay with blur effect.
 * Dismisses modal when clicked (since modal={false} omits default overlay).
 */
interface ModalBackdropProps {
  open: boolean;
  onClose: () => void;
}

function ModalBackdrop({ open, onClose }: ModalBackdropProps) {
  return (
    <div
      role="presentation"
      data-state={open ? "open" : "closed"}
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      )}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    />
  );
}

// ============================================================================
// MODAL HEADER
// ============================================================================

/**
 * ModalHeader — Renders modal title, description, icon, and action area.
 * Provides consistent spacing and layout for all modal headers.
 */
interface ModalHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
}

function ModalHeader({ title, description, icon, headerAction }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-border/60 shrink-0">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <HeaderIcon icon={icon} />}
        <DialogHeader className="min-w-0">
          <DialogTitle className="pr-8">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      </div>
      {headerAction && (
        <div className="shrink-0 pr-8">{headerAction}</div>
      )}
    </div>
  );
}

// ============================================================================
// HEADER ICON
// ============================================================================

/**
 * HeaderIcon — Decorative icon for modal header.
 * Displays in a rounded container with primary color accent.
 */
interface HeaderIconProps {
  icon: React.ReactNode;
}

function HeaderIcon({ icon }: HeaderIconProps) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
      {icon}
    </div>
  );
}

// ============================================================================
// MODAL BODY
// ============================================================================

/**
 * ModalBody — Content container with consistent padding.
 * Wraps modal content and provides scrollable area if needed.
 */
interface ModalBodyProps {
  children: React.ReactNode;
}

function ModalBody({ children }: ModalBodyProps) {
  return <div className="px-6 py-5">{children}</div>;
}

// ============================================================================
// CLOSE BUTTON
// ============================================================================

/**
 * CloseButton — Floating X button in top-right corner.
 * Always visible and accessible for quick modal dismissal.
 */
function CloseButton() {
  return (
    <DialogPrimitive.Close className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );
}
