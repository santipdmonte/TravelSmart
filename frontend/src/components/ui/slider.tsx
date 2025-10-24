"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommit,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const [isDragging, setIsDragging] = React.useState(false);

  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max],
    [value, defaultValue, min, max]
  );

  const handleValueChange = (value: number[]) => {
    console.log("🟢 handleValueChange called:", value);
    setIsDragging(true);
    onValueChange?.(value);
  };

  const handleValueCommit = (value: number[]) => {
    console.log("🔵 handleValueCommit called:", value);
    setIsDragging(false);
    onValueCommit?.(value);
  };

  console.log("🎯 Slider render - isDragging:", isDragging, "value:", value);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      {...props}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            !isDragging && "transition-all duration-300 ease-out"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
            !isDragging && "transition-all duration-300 ease-out"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
