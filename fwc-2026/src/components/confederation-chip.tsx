import { cn } from "@/lib/utils";

export type Confederation =
  | "UEFA"
  | "CONMEBOL"
  | "CONCACAF"
  | "CAF"
  | "AFC"
  | "OFC";

const META: Record<
  Confederation,
  { label: string; color: string; tint: string }
> = {
  UEFA: {
    label: "UEFA",
    color: "oklch(0.62 0.16 258)",
    tint: "oklch(0.62 0.16 258 / 0.16)",
  },
  CONMEBOL: {
    label: "CONMEBOL",
    color: "oklch(0.82 0.15 92)",
    tint: "oklch(0.82 0.15 92 / 0.16)",
  },
  CONCACAF: {
    label: "CONCACAF",
    color: "oklch(0.74 0.18 162)",
    tint: "oklch(0.74 0.18 162 / 0.16)",
  },
  CAF: {
    label: "CAF",
    color: "oklch(0.65 0.22 25)",
    tint: "oklch(0.65 0.22 25 / 0.16)",
  },
  AFC: {
    label: "AFC",
    color: "oklch(0.68 0.2 350)",
    tint: "oklch(0.68 0.2 350 / 0.16)",
  },
  OFC: {
    label: "OFC",
    color: "oklch(0.7 0.14 210)",
    tint: "oklch(0.7 0.14 210 / 0.16)",
  },
};

/**
 * Mini chip for the team's confederation. In `compact` mode it renders only
 * the color dot for dense cards; in normal mode it adds the abbreviation.
 */
export function ConfederationChip({
  confederation,
  compact = false,
  className,
}: {
  confederation: Confederation;
  compact?: boolean;
  className?: string;
}) {
  const meta = META[confederation];
  return (
    <span
      title={meta.label}
      aria-label={meta.label}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none",
        compact && "px-0.5",
        className,
      )}
      style={{ color: meta.color, backgroundColor: meta.tint }}
    >
      <span
        className="block h-1 w-1 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {!compact && meta.label}
    </span>
  );
}
