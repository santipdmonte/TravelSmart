"use client";

import React from "react";
import Image from "next/image";
import { Progress } from "@/components/ui";

const AVATARS = [
  "/avatars/oscar_mapas.png",
  "/avatars/oscar_book.png",
  "/avatars/oscar_lupa.png",
  "/avatars/osca_thinking.png",
  "/avatars/oscar_planning.png",
];

const ROTATE_INTERVAL_MS = 6000;
const TOTAL_DURATION_MS = 60_000; // 1 minute

function useImageRotation(totalImages: number, intervalMs: number) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (totalImages <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % totalImages);
    }, intervalMs);
    return () => clearInterval(id);
  }, [totalImages, intervalMs]);
  return index;
}

function useLogProgress(totalMs: number) {
  const [value, setValue] = React.useState(0); // 0-100

  React.useEffect(() => {
    const startTime = Date.now();
    const a = 0.00025; // tuned constant for logarithmic easing
    const T = totalMs;

    // Use setInterval instead of requestAnimationFrame to ensure consistent updates
    // regardless of user interactions or browser optimizations
    const interval = setInterval(() => {
      const elapsed = Math.min(Date.now() - startTime, T);
      const numerator = Math.log(1 + a * elapsed);
      const denominator = Math.log(1 + a * T);
      const pct = (numerator / denominator) * 100;
      setValue(pct);
      
      if (elapsed >= T) {
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [totalMs]);

  return value;
}

export default function Loader({
  size = 160,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const index = useImageRotation(AVATARS.length, ROTATE_INTERVAL_MS);
  const progress = useLogProgress(TOTAL_DURATION_MS);

  return (
    <div className={className} style={{ display: "grid", gap: 16, justifyItems: "center" }}>
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        <Image
          src={AVATARS[index]}
          alt="Loading avatar"
          fill
          sizes="(max-width: 768px) 50vw, 160px"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div style={{ width: Math.max(220, size), maxWidth: 480 }}>
        <Progress value={progress} />
        {/* <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6, textAlign: "center" }}>
          {Math.round(progress)}%
        </div> */}
      </div>
      
    </div>
  );
}

