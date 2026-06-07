"use client";

import { useTransition } from "react";
import { setHourFormatAction } from "@/lib/actions/timezone";
import type { HourFormat } from "@/lib/timezone";
import { cn } from "@/lib/utils";

export function HourFormatSetting({ current }: { current: HourFormat }) {
  const [pending, startTransition] = useTransition();

  const setTo = (hf: HourFormat) => {
    if (hf === current) return;
    startTransition(() => {
      void setHourFormatAction(hf);
    });
  };

  return (
    <div
      role="radiogroup"
      aria-label="Time format"
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-background p-1 text-sm",
        pending && "opacity-60",
      )}
    >
      <Option active={current === "24"} onClick={() => setTo("24")}>
        <span className="font-display text-base font-semibold">24h</span>
        <span className="text-xs text-muted-foreground">14:00</span>
      </Option>
      <Option active={current === "12"} onClick={() => setTo("12")}>
        <span className="font-display text-base font-semibold">12h</span>
        <span className="text-xs text-muted-foreground">2:00 p. m.</span>
      </Option>
    </div>
  );
}

function Option({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={active}
      className={cn(
        "flex min-w-[110px] flex-col items-center gap-0.5 rounded px-4 py-2 transition-colors",
        active
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
