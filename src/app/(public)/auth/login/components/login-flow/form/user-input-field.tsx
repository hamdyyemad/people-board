"use client";
import React from "react";
import { Label } from "@/frontend_lib/components/ui/label";
import { Input } from "@/frontend_lib/components/ui/input";
import { User, Hash } from "lucide-react";
import { type UserRole } from "@/frontend_lib/hooks/auth";

interface UserInputFieldProps {
  userRole: UserRole;
}

export function UserInputField({ userRole }: UserInputFieldProps) {
  const isHR = userRole === "HR";
  const inputLabel = isHR ? "Username" : "User ID";
  const inputPlaceholder = isHR
    ? "Enter your username (e.g., John.Doe)"
    : "Enter your user ID (numbers only)";
  const inputType = isHR ? "text" : "number";
  const inputIcon = isHR ? User : Hash;

  return (
    <div className="space-y-2">
      <Label htmlFor="userInput" className="text-sm font-normal">
        {inputLabel}
      </Label>
      <div className="relative">
        {React.createElement(inputIcon, {
          className:
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
        })}
        <Input
          id="userInput"
          type={inputType}
          placeholder={inputPlaceholder}
          className="h-12 pl-10 bg-background"
          required
        />
      </div>
    </div>
  );
}
