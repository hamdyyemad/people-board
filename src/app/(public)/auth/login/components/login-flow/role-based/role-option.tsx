"use client";
import { type UserRole } from "@/frontend_lib/hooks/auth";
import { useGlowEffect } from "../../../hooks/use-glow-effect";

interface RoleOption {
  id: UserRole;
  label: string;
  description: string;
  icon: string;
  glowColor: string;
  iconColor: string;
}

interface RoleOptionProps {
  option: RoleOption;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
}

export function RoleOption({ option, isSelected, onSelect }: RoleOptionProps) {
  const { handleMouseMove, glowRefs } = useGlowEffect();

  return (
    <li>
      <input
        type="radio"
        id={`${option.id.toLowerCase()}-option`}
        name="userRole"
        value={option.id}
        className="hidden peer"
        checked={isSelected}
        onChange={() => onSelect(option.id)}
      />
      <label
        htmlFor={`${option.id.toLowerCase()}-option`}
        className="hover-card inline-flex items-center justify-between w-full p-5 text-muted-foreground bg-background border-2 border-border rounded-lg cursor-pointer peer-checked:border-primary hover:text-foreground peer-checked:text-foreground hover:bg-muted/50 relative overflow-hidden"
        style={{ "--glow-color": option.glowColor } as React.CSSProperties}
        onMouseMove={(e) => handleMouseMove(e, option.id)}
      >
        {/* Glow effect container */}
        <div className="glow absolute inset-0 opacity-0 transition-opacity duration-300">
          <div
            ref={(el) => {
              glowRefs.current[option.id] = el;
            }}
            className="glow-circle"
          ></div>
        </div>

        {/* Content */}
        <div className="block relative z-10">
          <svg
            className={`mb-2 w-7 h-7 ${option.iconColor}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={option.icon} />
          </svg>
          <div className="w-full text-lg font-semibold">{option.label}</div>
          <div className="w-full text-sm">{option.description}</div>
        </div>
      </label>
    </li>
  );
}
