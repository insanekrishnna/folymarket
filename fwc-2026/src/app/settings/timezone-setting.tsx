"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setTimezoneAction } from "@/lib/actions/timezone";
import { COMMON_TIMEZONES, type TimezoneOption } from "@/lib/timezone";
import { cn } from "@/lib/utils";

type Region = TimezoneOption["region"];
const REGIONS: Region[] = ["Americas", "Europe", "Asia", "Oceania", "Africa"];

export function TimezoneSetting({ currentTz }: { currentTz: string }) {
  const [pending, startTransition] = useTransition();
  const inList = COMMON_TIMEZONES.some((t) => t.value === currentTz);

  return (
    <label className="block">
      <div className="relative">
        <select
          value={currentTz}
          onChange={(e) => {
            const v = e.target.value;
            startTransition(() => {
              void setTimezoneAction(v);
            });
          }}
          disabled={pending}
          aria-label="Timezone"
          className={cn(
            "h-10 w-full cursor-pointer rounded-md border border-border bg-background px-3 pr-10 text-sm shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            pending && "opacity-60",
          )}
        >
          {!inList && <option value={currentTz}>{currentTz}</option>}
          {REGIONS.map((region) => (
            <optgroup key={region} label={region}>
              {COMMON_TIMEZONES.filter((t) => t.region === region).map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {pending && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
    </label>
  );
}
