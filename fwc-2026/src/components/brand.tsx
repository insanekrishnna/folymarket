import { cn } from "@/lib/utils";

export function Brand({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: { outer: "text-[11px]", mark: "size-5" },
    md: { outer: "text-xs", mark: "size-[22px]" },
    lg: { outer: "text-sm", mark: "size-8" },
  }[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-semibold uppercase tracking-[0.14em]",
        sizes.outer,
        className,
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-[7px] bg-primary text-white shadow-[0_14px_28px_rgba(19,201,120,0.24)]",
          sizes.mark,
        )}
      >
        <SoccerBall className="size-3.5" />
      </span>
      <span>FWC</span>
      <span className="font-bold text-primary">26</span>
    </div>
  );
}

/**
 * Themed spinner: rolling ball rotating on its axis.
 * Use instead of Loader2 in pending states.
 */
export function BallSpinner({ className }: { className?: string }) {
  return (
    <SoccerBall
      className={cn(
        "animate-spin [animation-duration:0.9s] motion-reduce:animate-none",
        className,
      )}
    />
  );
}

/** Inline soccer-ball icon (lightweight SVG, no emoji). */
export function SoccerBall({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 4.5l3.8 2.8-1.5 4.4h-4.6L8.2 7.3 12 4.5z" />
      <path d="M10.2 11.7l1.8 5.6 1.8-5.6" />
      <path d="M3.8 10.2l3 2.2-.7 4.2" />
      <path d="M20.2 10.2l-3 2.2.7 4.2" />
      <path d="M6.1 17.2l2.6-.5" />
      <path d="M17.9 17.2l-2.6-.5" />
    </svg>
  );
}
