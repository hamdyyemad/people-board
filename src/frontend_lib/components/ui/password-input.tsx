"use client";
import React, { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/frontend_lib/utils/utils";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  showIcon?: boolean;
  iconClassName?: string;
  toggleClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      showIcon = true,
      iconClassName,
      toggleClassName,
      placeholder = "Enter your password",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative">
        {showIcon && (
          <Lock
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              iconClassName
            )}
          />
        )}
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={cn(
            "h-12 pl-10 pr-12 bg-background min-h-[44px]",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 min-w-[44px] min-h-[44px] flex items-center justify-center",
            toggleClassName
          )}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
