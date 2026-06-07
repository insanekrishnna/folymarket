import { cn } from "@/lib/utils";
import { isoForFifa } from "@/lib/flag";

type FlagSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<FlagSize, string> = {
  xs: "h-3 w-[18px]",
  sm: "h-4 w-6",
  md: "h-5 w-[30px]",
  lg: "h-6 w-9",
  xl: "h-10 w-14",
};

/**
 * Country flag rendered from the FIFA 3-letter code via the `flag-icons` CSS.
 *
 * Requires the global `flag-icons/css/flag-icons.min.css` import (done in the
 * root layout). If the code is unknown, falls back to a neutral gray square
 * so the layout doesn't shift.
 */
export function Flag({
  code,
  size = "sm",
  className,
  title,
}: {
  code: string | null | undefined;
  size?: FlagSize;
  className?: string;
  title?: string;
}) {
  const iso = isoForFifa(code);
  const sizeClass = SIZE_CLASS[size];

  if (!iso) {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-block rounded-[2px] border border-border/40 bg-muted",
          sizeClass,
          className,
        )}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={title ?? code ?? undefined}
      title={title ?? code ?? undefined}
      className={cn(
        `fi fi-${iso}`,
        "!inline-block rounded-[2px] border border-border/40 !bg-cover !bg-center !bg-no-repeat",
        sizeClass,
        className,
      )}
    />
  );
}
