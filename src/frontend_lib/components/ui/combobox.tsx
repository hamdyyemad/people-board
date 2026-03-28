"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/frontend_lib/utils/utils";
import { Button } from "@/frontend_lib/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/frontend_lib/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/frontend_lib/components/ui/popover";

export interface ComboboxOption {
  label: string;
  value: string;
}

export interface ComboboxProps {
  /** Current selected value */
  value: string;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Array of options */
  options: ComboboxOption[];
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className for the trigger button */
  className?: string;
}

/**
 * Combobox - A searchable select dropdown component
 * 
 * Features:
 * - Searchable with keyboard navigation
 * - Light/dark mode support
 * - Accessibility built-in (via Radix UI)
 * - Clean, modern design
 * 
 * @example
 * ```tsx
 * <Combobox
 *   value={selectedDept}
 *   onValueChange={setSelectedDept}
 *   options={departments}
 *   placeholder="Select department..."
 *   searchPlaceholder="Search departments..."
 * />
 * ```
 */
export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      const selected = options.find((option) => option.value === currentValue);
      if (selected) {
        onValueChange(selected.value);
      }
      setOpen(false);
      setSearch("");
    },
    [options, onValueChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] w-[--radix-popover-trigger-width] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={false}
      >
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options
                .filter((option) => 
                  option.label.toLowerCase().includes(search.toLowerCase())
                )
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    onSelect={handleSelect}
                    className="cursor-pointer hover:!bg-primary/10 hover:!text-primary data-[selected='true']:bg-primary/5"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 flex-shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
