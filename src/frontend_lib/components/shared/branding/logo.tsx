import { cn } from "@/frontend_lib/utils/utils";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ showText = true, size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-gradient-to-br from-[#0d4d4d] to-[#0a5c5c] text-white font-bold shadow-lg",
          sizeClasses[size]
        )}
      >
        PB
      </div>
      {showText && (
        <span
          className={cn("font-semibold tracking-tight", textSizeClasses[size])}
        >
          PeopleBoard
        </span>
      )}
    </div>
  );
}
