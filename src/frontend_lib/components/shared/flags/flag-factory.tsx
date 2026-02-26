"use client";

import { cn } from "@/frontend_lib/utils/utils";

export type FlagCode = "us" | "eg";

/** Paths to flag SVGs in public folder. Add new flags under public/flags/<code>.svg */
const FLAG_SRCS: Record<FlagCode, string> = {
  us: "/flags/us.svg",
  eg: "/flags/eg.svg",
};

interface FlagProps {
  code: FlagCode;
  size?: number;
  className?: string;
  rounded?: boolean;
}

const FLAG_ASPECT = 14.4 / 24; // height/width from viewBox "0 0 24 14.4"

export function Flag({
  code,
  size = 24,
  className,
  rounded = false,
}: FlagProps) {
  const src = FLAG_SRCS[code];
  if (!src) return null;

  const width = size;
  const height = size * FLAG_ASPECT;

  if (rounded) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
          className
        )}
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt=""
          role="presentation"
          className="h-full w-full object-cover"
          width={size}
          height={size}
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-block shrink-0", className)}>
      <img
        src={src}
        alt=""
        role="presentation"
        width={width}
        height={height}
        className="block"
      />
    </span>
  );
}
