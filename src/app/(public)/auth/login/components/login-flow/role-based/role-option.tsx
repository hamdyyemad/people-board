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
  onDoubleClick?: (role: UserRole) => void;
}

export function RoleOption({
  option,
  isSelected,
  onSelect,
  onDoubleClick,
}: RoleOptionProps) {
  const { handleMouseMove, glowRefs } = useGlowEffect();

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(option.id);
    }
  };

  return (
    <li>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .hover-card {
            transform-style: preserve-3d;
            transform: perspective(1000px);
          }

          .glow {
            background: transparent;
            pointer-events: none;
            z-index: 1;
          }

          .glow-circle {
            position: absolute;
            width: 100px;
            height: 100px;
            background: radial-gradient(
              circle at center,
              rgba(var(--glow-color, 59, 130, 246), 0.5) 0%,
              rgba(var(--glow-color, 59, 130, 246), 0) 80%
            );
            border-radius: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: opacity 0.3s ease-out, left 0.1s ease-out, top 0.1s ease-out;
            pointer-events: none;
            mix-blend-mode: soft-light;
            will-change: left, top;
            left: 50%;
            top: 50%;
          }

          .hover-card:hover .glow {
            opacity: 1;
          }

          .hover-card:hover .glow-circle {
            opacity: 1;
          }
        `,
        }}
      />
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
        className="hover-card inline-flex items-center justify-between w-full p-5 text-foreground bg-background border-2 border-border rounded-lg cursor-pointer peer-checked:border-primary hover:text-foreground peer-checked:text-foreground hover:bg-muted/50 relative overflow-hidden"
        style={{ "--glow-color": option.glowColor } as React.CSSProperties}
        onMouseMove={(e) => handleMouseMove(e, option.id)}
        onDoubleClick={handleDoubleClick}
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
          <div className="w-full text-lg font-semibold text-foreground">
            {option.label}
          </div>
          <div className="w-full text-sm text-foreground/80">
            {option.description}
          </div>
        </div>
      </label>
    </li>
  );
}
