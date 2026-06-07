"use client";

import { useEffect, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };
type CountdownState = { mounted: boolean; parts: Parts | null };

function compute(target: Date): Parts | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff / 3_600_000) % 24);
  const minutes = Math.floor((diff / 60_000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function Countdown({ targetIso, label }: { targetIso: string; label: string }) {
  // Render an empty skeleton on first pass so SSR and the first client render
  // agree. The real values are computed in useEffect on the client only.
  const [state, setState] = useState<CountdownState>({
    mounted: false,
    parts: null,
  });

  useEffect(() => {
    const target = new Date(targetIso);
    const update = () => setState({ mounted: true, parts: compute(target) });
    const first = window.setTimeout(update, 0);
    const t = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [targetIso]);

  if (!state.mounted) {
    return (
      <div className="grid grid-cols-4 gap-2 sm:gap-4" aria-hidden>
        <Cell value={0} label="days" />
        <Cell value={0} label="hours" />
        <Cell value={0} label="min" />
        <Cell value={0} label="sec" />
      </div>
    );
  }

  if (!state.parts) {
    return <p className="font-mono text-sm text-black/55">{label} is in progress or already happened.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      <Cell value={state.parts.days} label="days" />
      <Cell value={state.parts.hours} label="hours" />
      <Cell value={state.parts.minutes} label="min" />
      <Cell value={state.parts.seconds} label="sec" />
    </div>
  );
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/55 px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:px-4 sm:py-4">
      <div className="font-mono text-2xl font-bold tabular-nums text-black sm:text-4xl">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-black/45 sm:text-xs">
        {label}
      </div>
    </div>
  );
}
