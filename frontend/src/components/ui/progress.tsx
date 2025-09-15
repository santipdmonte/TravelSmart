"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 - 100
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-gray-200/80",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full rounded-full bg-primary transition-[clip-path] duration-300 ease-out",
        )}
        // Use clip-path for smoother edges while animating
        style={{
          clipPath: `inset(0 ${100 - clamped}% 0 0 round 9999px)`,
        }}
      />
    </div>
  );
}

export default Progress;


