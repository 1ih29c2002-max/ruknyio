"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  repeat?: number;
  [key: string]: any;
}

export function Marquee({
  children,
  className,
  reverse,
  pauseOnHover = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row",
              reverse && "[animation-direction:reverse]",
              pauseOnHover && "group-hover:[animation-play-state:paused]",
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
