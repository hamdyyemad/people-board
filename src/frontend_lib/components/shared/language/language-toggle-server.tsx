import { LanguageToggle } from "./language-toggle";

interface LanguageToggleServerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function LanguageToggleServer({
  className,
  size = "md",
  showText = false,
}: LanguageToggleServerProps) {
  return (
    <LanguageToggle className={className} size={size} showText={showText} />
  );
}
