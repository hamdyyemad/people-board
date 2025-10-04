import { cn } from "@/frontend_lib/utils/utils";

interface IconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Icon({ size = "md", className }: IconProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
    xl: "w-12 h-12 text-lg",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br from-[#0d4d4d] to-[#0a5c5c] text-white font-bold shadow-lg",
        sizeClasses[size],
        className
      )}
    >
      PB
    </div>
  );
}
