"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Pennant = { code: string; name: string; iso: string | null };

const SIGMA = 160;
const MAX_ANGLE = 22;
const PENNANT_STYLE = {
  width: 22,
  height: 26,
  clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)",
} as const;

export function BuntingClient({
  teams,
  className,
}: {
  teams: Pennant[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wind = { x: 0, vx: 0, strength: 0 };
    const last = { x: 0, t: 0 };

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const now = performance.now();
      const dt = now - last.t;
      if (dt > 0 && dt < 200) {
        const vx = (x - last.x) / dt; // px per ms
        wind.vx = wind.vx * 0.55 + vx * 0.45;
      }
      wind.x = x;
      // Fan load: the faster the mouse, the stronger the gust.
      const boost = Math.min(1, Math.abs(wind.vx) * 1.8);
      wind.strength = Math.min(1, wind.strength * 0.75 + boost);
      last.x = x;
      last.t = now;
    };

    root.addEventListener("pointermove", onMove);

    let raf = 0;
    const tick = () => {
      // Global decay, about 1.5s until rest.
      wind.strength *= 0.965;
      wind.vx *= 0.92;

      const rect = root.getBoundingClientRect();
      const dir = wind.vx === 0 ? 0 : -Math.sign(wind.vx);
      const items = itemRefs.current;
      for (let i = 0; i < items.length; i++) {
        const li = items[i];
        if (!li) continue;
        const r = li.getBoundingClientRect();
        const cx = r.left + r.width / 2 - rect.left;
        const d = cx - wind.x;
        const gauss = Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
        const angle = dir * gauss * wind.strength * MAX_ANGLE;
        li.style.setProperty("--gust", `${angle.toFixed(2)}deg`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn("relative w-full select-none", className)}
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />
      <div
        className="overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        }}
      >
        <ul className="bunting-track flex w-max flex-nowrap items-start gap-x-1.5 px-2 pt-0.5">
        {[...teams, ...teams].map((t, i) => (
          <li
            key={`${t.code}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="bunting-pennant shrink-0"
            style={{ animationDelay: `${-(((i * 173) % 2800) / 1000)}s` }}
            title={t.name}
          >
            <div className="bunting-gust flex flex-col items-center">
              <span className="block h-1 w-1 rounded-full bg-border/80" />
              {t.iso ? (
                <span
                  className={`fi fi-${t.iso} !block !bg-cover !bg-center drop-shadow-sm`}
                  style={PENNANT_STYLE}
                />
              ) : (
                <span className="block bg-muted" style={PENNANT_STYLE} />
              )}
            </div>
          </li>
        ))}
        </ul>
      </div>
    </div>
  );
}
