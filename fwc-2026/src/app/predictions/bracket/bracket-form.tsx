"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Download, Image as ImageIcon, Lock, Medal, Save, Swords, Trophy } from "lucide-react";
import { BallSpinner } from "@/components/brand";
import { fireConfetti } from "@/lib/confetti";
import {
  saveKnockoutPredictions,
  type SavePredictionsState,
} from "@/lib/actions/predictions";
import {
  resolveKnockout,
  type KnockoutMatchInput,
  type Standing,
} from "@/lib/bracket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flag } from "@/components/flag";
import { cn } from "@/lib/utils";
import type { Stage } from "@/generated/prisma/enums";
import { formatDate } from "@/lib/datetime";
import type { DatePrefs } from "@/lib/timezone";

export type TeamLite = { id: number; code: string; name: string };

export type BracketRow = {
  id: number;
  matchNumber: number;
  stage: Stage;
  dateIso: string;
  venue: string;
  city: string;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  initialHomeScore: number | null;
  initialAwayScore: number | null;
  initialWinnerId: number | null;
  locked: boolean;
  actual: { homeScore: number; awayScore: number } | null;
};

type FieldState = { home: string; away: string; winner: string };

const STAGE_LABEL: Record<Stage, string> = {
  GROUP: "Group Stage",
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarterfinals",
  SF: "Semifinals",
  TP: "Third Place",
  FINAL: "Final",
};

// Bracket layout: match numbers per side & round, top-to-bottom.
// Pair semantics: LEFT.R16[i] is fed by LEFT.R32[2i] and LEFT.R32[2i+1].
const LEFT = {
  R32: [74, 77, 73, 75, 83, 84, 81, 82],
  R16: [89, 90, 93, 94],
  QF: [97, 98],
  SF: [101],
};
const RIGHT = {
  R32: [76, 78, 79, 80, 86, 88, 85, 87],
  R16: [91, 92, 95, 96],
  QF: [99, 100],
  SF: [102],
};
const FINAL_NUM = 104;

const INITIAL_FORM_STATE: SavePredictionsState = {};

export function BracketForm({
  rows,
  teams,
  standings,
  prefs,
}: {
  rows: BracketRow[];
  teams: TeamLite[];
  standings: Standing[];
  prefs: DatePrefs;
}) {
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const [fields, setFields] = useState<Record<number, FieldState>>(() => {
    const init: Record<number, FieldState> = {};
    for (const r of rows) {
      init[r.id] = {
        home: r.initialHomeScore === null ? "" : String(r.initialHomeScore),
        away: r.initialAwayScore === null ? "" : String(r.initialAwayScore),
        winner: r.initialWinnerId === null ? "" : String(r.initialWinnerId),
      };
    }
    return init;
  });

  const updateField = useCallback(
    (id: number, key: keyof FieldState, value: string) =>
      setFields((prev) => ({
        ...prev,
        [id]: { ...prev[id], [key]: value },
      })),
    [],
  );

  const resolutions = useMemo(() => {
    const toNum = (s: string): number | null =>
      s === "" || s === null ? null : Number(s);
    const inputs: KnockoutMatchInput[] = rows.map((r) => ({
      id: r.id,
      matchNumber: r.matchNumber,
      homePlaceholder: r.homePlaceholder,
      awayPlaceholder: r.awayPlaceholder,
      predictedHome: toNum(fields[r.id]?.home ?? ""),
      predictedAway: toNum(fields[r.id]?.away ?? ""),
      predictedWinnerId: toNum(fields[r.id]?.winner ?? ""),
    }));
    return resolveKnockout(standings, inputs);
  }, [rows, fields, standings]);

  const resolvedById = useMemo(
    () => new Map(resolutions.map((r) => [r.matchId, r])),
    [resolutions],
  );

  const [serverState, formAction, pending] = useActionState(
    saveKnockoutPredictions,
    INITIAL_FORM_STATE,
  );

  useEffect(() => {
    if (serverState.ok && serverState.savedCount !== undefined) {
      if (serverState.savedCount === 0) toast.info("No changes to save.");
      else {
        toast.success(
          `Saved (${serverState.savedCount} ${serverState.savedCount === 1 ? "match" : "matches"}).`,
        );
        fireConfetti();
      }
    } else if (serverState.error) {
      toast.error(serverState.error);
    }
  }, [serverState]);

  const rowByNumber = useMemo(
    () => new Map(rows.map((r) => [r.matchNumber, r])),
    [rows],
  );
  const teamsFor = useCallback(
    (row: BracketRow) => {
      const r = resolvedById.get(row.id);
      return {
        home: r?.homeTeamId ? teamById.get(r.homeTeamId) ?? null : null,
        away: r?.awayTeamId ? teamById.get(r.awayTeamId) ?? null : null,
      };
    },
    [resolvedById, teamById],
  );

  const cardProps = useCallback(
    (row: BracketRow): CardProps => ({
      row,
      field: fields[row.id] ?? { home: "", away: "", winner: "" },
      live: teamsFor(row),
      onChange: updateField,
      prefs,
    }),
    [fields, teamsFor, updateField, prefs],
  );

  // --- Export-as-image ---
  const bracketSnapshotRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const champion = useMemo(() => {
    const final = rowByNumber.get(FINAL_NUM);
    if (!final) return null;
    const f = fields[final.id];
    if (!f) return null;
    const h = f.home === "" ? null : Number(f.home);
    const a = f.away === "" ? null : Number(f.away);
    const live = teamsFor(final);
    if (!live.home || !live.away || h === null || a === null) return null;
    if (h > a) return live.home;
    if (h < a) return live.away;
    const w = f.winner === "" ? null : Number(f.winner);
    if (w === live.home.id) return live.home;
    if (w === live.away.id) return live.away;
    return null;
  }, [fields, rowByNumber, teamsFor]);

  const handleExport = async (mode: "share" | "download") => {
    const node = bracketSnapshotRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue("--background")
          .trim() || "#0a0a0a",
        filter: (el) => {
          // Skip inputs' native UI chrome by keeping values visible
          return !(el as HTMLElement)?.dataset?.noExport;
        },
      });

      const fileName = `my-world-cup-2026-bracket${champion ? `-${champion.code}` : ""}.png`;

      if (mode === "share") {
        // Try Web Share API with file
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], fileName, { type: "image/png" });
          const nav = navigator as Navigator & {
            canShare?: (data: { files: File[] }) => boolean;
            share: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
          };
          if (nav.canShare?.({ files: [file] })) {
            await nav.share({
              files: [file],
              title: "My World Cup 2026 bracket",
              text: champion
                ? `My pick: ${champion.name} World Cup 2026 champion`
                : "Check out my World Cup 2026 bracket",
            });
            return;
          }
        } catch {
          // user cancelled or unsupported — fallback to download
        }
      }

      // Fallback: trigger a download
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate image");
    } finally {
      setExporting(false);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {serverState.error && (
        <Alert variant="destructive">
          <AlertDescription>{serverState.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={exporting}
          onClick={() => handleExport("share")}
          className="gap-1.5"
        >
          {exporting ? <BallSpinner className="size-3.5" /> : <ImageIcon className="size-3.5" />}
          Share image
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={exporting}
          onClick={() => handleExport("download")}
          className="gap-1.5"
        >
          <Download className="size-3.5" />
          Download PNG
        </Button>
      </div>

      <div ref={bracketSnapshotRef} className="rounded-2xl bg-background">
        {/* Desktop bracket with connectors */}
        <DesktopBracket
          rows={rows}
          cardProps={cardProps}
          rowByNumber={rowByNumber}
          champion={champion}
        />

        {/* Mobile bracket: stacked per-stage */}
        <MobileBracket
          cardProps={cardProps}
          rowByNumber={rowByNumber}
          champion={champion}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/60 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Entering a score advances the winner to the next round. Save when you&apos;re done.
        </p>
        <Button type="submit" disabled={pending} className="gap-1.5">
          {pending ? (
            <BallSpinner className="size-3.5" />
          ) : (
            <Save className="size-3.5" />
          )}
          {pending ? "Saving..." : "Save Bracket"}
        </Button>
      </div>
    </form>
  );
}

// ============================================================
// DESKTOP LAYOUT + CONNECTORS
// ============================================================

function DesktopBracket({
  rows,
  cardProps,
  rowByNumber,
  champion,
}: {
  rows: BracketRow[];
  cardProps: (row: BracketRow) => CardProps;
  rowByNumber: Map<number, BracketRow>;
  champion: TeamLite | null;
}) {
  const pick = useCallback(
    (ns: number[]) => ns.map((n) => rowByNumber.get(n)).filter(Boolean) as BracketRow[],
    [rowByNumber],
  );

  const final = rows.find((r) => r.stage === "FINAL");
  const thirdPlace = rows.find((r) => r.stage === "TP");

  const containerRef = useRef<HTMLDivElement>(null);
  // Callback refs keyed by match number.
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const setCardRef = useCallback(
    (matchNumber: number) => (el: HTMLElement | null) => {
      if (el) cardRefs.current.set(matchNumber, el);
      else cardRefs.current.delete(matchNumber);
    },
    [],
  );

  return (
    <div className="relative hidden lg:block">
      <div ref={containerRef} className="relative overflow-x-auto rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
        <div className="relative grid min-h-[860px] grid-cols-[164px_176px_192px_204px_240px_204px_192px_176px_164px] gap-x-6 gap-y-4 xl:grid-cols-[176px_188px_204px_216px_260px_216px_204px_188px_176px] xl:gap-x-8">
          <BracketColumn
            side="left"
            title={STAGE_LABEL.R32}
            items={pick(LEFT.R32).map(cardProps)}
            setCardRef={setCardRef}
          />
          <BracketColumn
            side="left"
            title={STAGE_LABEL.R16}
            items={pick(LEFT.R16).map(cardProps)}
            setCardRef={setCardRef}
          />
          <BracketColumn
            side="left"
            title={STAGE_LABEL.QF}
            items={pick(LEFT.QF).map(cardProps)}
            setCardRef={setCardRef}
          />
          <BracketColumn
            side="left"
            title={STAGE_LABEL.SF}
            items={pick(LEFT.SF).map(cardProps)}
            setCardRef={setCardRef}
          />

          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                <Trophy className="size-3.5" />
                <span>Final</span>
              </div>
              {final && (
                <div ref={setCardRef(final.matchNumber)} className="w-full">
                  <MatchCard {...cardProps(final)} variant="final" />
                </div>
              )}
              {champion && <ChampionBanner champion={champion} />}
            </div>

            {thirdPlace && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--bronze)]">
                  <Medal className="size-3.5" />
                  <span>Third place</span>
                </div>
                <MatchCard {...cardProps(thirdPlace)} variant="third" />
              </div>
            )}
          </div>

          <BracketColumn
            side="right"
            title={STAGE_LABEL.SF}
            items={pick(RIGHT.SF).map(cardProps)}
            setCardRef={setCardRef}
          />
          <BracketColumn
            side="right"
            title={STAGE_LABEL.QF}
            items={pick(RIGHT.QF).map(cardProps)}
            setCardRef={setCardRef}
          />
          <BracketColumn
            side="right"
            title={STAGE_LABEL.R16}
            items={pick(RIGHT.R16).map(cardProps)}
            setCardRef={setCardRef}
          />
          <BracketColumn
            side="right"
            title={STAGE_LABEL.R32}
            items={pick(RIGHT.R32).map(cardProps)}
            setCardRef={setCardRef}
          />

          <ConnectorOverlay containerRef={containerRef} cardRefs={cardRefs} />
        </div>
      </div>
    </div>
  );
}

function BracketColumn({
  side,
  title,
  items,
  setCardRef,
}: {
  side: "left" | "right";
  title: string;
  items: CardProps[];
  setCardRef: (n: number) => (el: HTMLElement | null) => void;
}) {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground",
          side === "right" && "justify-end",
        )}
      >
        {side === "left" && <Swords className="size-3.5" />}
        <span>{title}</span>
        {side === "right" && <Swords className="size-3.5" />}
      </div>
      <ul className="flex flex-1 flex-col justify-around gap-4">
        {items.map((c) => (
          <li key={c.row.id} ref={setCardRef(c.row.matchNumber)}>
            <MatchCard {...c} side={side} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Build the list of parent→children connections for the bracket tree.
// Pair semantics: children[2i], children[2i+1] → parent[i].
function buildConnections(): Array<{ parent: number; childA: number; childB: number }> {
  const out: Array<{ parent: number; childA: number; childB: number }> = [];
  const chain = (arr: number[], parents: number[]) => {
    for (let i = 0; i < parents.length; i++) {
      out.push({ parent: parents[i], childA: arr[2 * i], childB: arr[2 * i + 1] });
    }
  };
  chain(LEFT.R32, LEFT.R16);
  chain(LEFT.R16, LEFT.QF);
  chain(LEFT.QF, LEFT.SF);
  chain(RIGHT.R32, RIGHT.R16);
  chain(RIGHT.R16, RIGHT.QF);
  chain(RIGHT.QF, RIGHT.SF);
  // Final is fed by both SFs
  out.push({ parent: FINAL_NUM, childA: LEFT.SF[0], childB: RIGHT.SF[0] });
  return out;
}

function ConnectorOverlay({
  containerRef,
  cardRefs,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  cardRefs: React.RefObject<Map<number, HTMLElement>>;
}) {
  const [paths, setPaths] = useState<string[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const recompute = () => {
    const container = containerRef.current;
    const refs = cardRefs.current;
    if (!container || !refs) return;

    const cRect = container.getBoundingClientRect();
    setSize({ w: container.scrollWidth, h: container.scrollHeight });

    const connections = buildConnections();
    const finalNumber = FINAL_NUM;

    const newPaths: string[] = [];
    for (const { parent, childA, childB } of connections) {
      const pEl = refs.get(parent);
      const aEl = refs.get(childA);
      const bEl = refs.get(childB);
      if (!pEl || !aEl || !bEl) continue;

      const p = pEl.getBoundingClientRect();
      const a = aEl.getBoundingClientRect();
      const b = bEl.getBoundingClientRect();

      // Determine side: children are to the left of parent ? → left side; else right side.
      // Exception: final's childA=LEFT.SF (left), childB=RIGHT.SF (right) — draw two separate side paths.
      if (parent === finalNumber) {
        // left SF → final
        newPaths.push(
          buildSidedPath(a, p, "left", cRect),
          buildSidedPath(b, p, "right", cRect),
        );
        continue;
      }

      const childIsLeftOfParent = a.right < p.left;
      const side: "left" | "right" = childIsLeftOfParent ? "left" : "right";
      newPaths.push(
        buildPairPath(a, b, p, side, cRect),
      );
    }
    setPaths(newPaths);
  };

  useLayoutEffect(() => {
    recompute();
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => recompute());
    ro.observe(container);
    for (const el of cardRefs.current.values()) ro.observe(el);

    const onScroll = () => recompute();
    container.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);

    return () => {
      ro.disconnect();
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

  }, []);

  if (size.w === 0 || size.h === 0) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
      width={size.w}
      height={size.h}
      viewBox={`0 0 ${size.w} ${size.h}`}
      preserveAspectRatio="none"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="oklch(0.74 0.18 162 / 0.35)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// Draws two children → parent connector on one side (left or right).
function buildPairPath(
  a: DOMRect,
  b: DOMRect,
  parent: DOMRect,
  side: "left" | "right",
  container: DOMRect,
): string {
  const ox = -container.left + window.scrollX;
  const oy = -container.top + window.scrollY;

  const aCy = a.top + a.height / 2 + oy;
  const bCy = b.top + b.height / 2 + oy;
  const pCy = parent.top + parent.height / 2 + oy;

  if (side === "left") {
    // children have right edge < parent.left
    const childExitX = Math.max(a.right, b.right) + ox;
    const parentEntryX = parent.left + ox;
    const midX = (childExitX + parentEntryX) / 2;
    return [
      `M ${a.right + ox} ${aCy}`,
      `H ${midX}`,
      `V ${bCy}`,
      `M ${b.right + ox} ${bCy}`,
      `H ${midX}`,
      `V ${pCy}`,
      `H ${parentEntryX}`,
    ].join(" ");
  } else {
    const childExitX = Math.min(a.left, b.left) + ox;
    const parentEntryX = parent.right + ox;
    const midX = (childExitX + parentEntryX) / 2;
    return [
      `M ${a.left + ox} ${aCy}`,
      `H ${midX}`,
      `V ${bCy}`,
      `M ${b.left + ox} ${bCy}`,
      `H ${midX}`,
      `V ${pCy}`,
      `H ${parentEntryX}`,
    ].join(" ");
  }
}

// Single connector (used for SF → Final on each side).
function buildSidedPath(
  child: DOMRect,
  parent: DOMRect,
  side: "left" | "right",
  container: DOMRect,
): string {
  const ox = -container.left + window.scrollX;
  const oy = -container.top + window.scrollY;
  const cCy = child.top + child.height / 2 + oy;
  const pCy = parent.top + parent.height / 2 + oy;

  if (side === "left") {
    const startX = child.right + ox;
    const endX = parent.left + ox;
    const midX = (startX + endX) / 2;
    return `M ${startX} ${cCy} H ${midX} V ${pCy} H ${endX}`;
  } else {
    const startX = child.left + ox;
    const endX = parent.right + ox;
    const midX = (startX + endX) / 2;
    return `M ${startX} ${cCy} H ${midX} V ${pCy} H ${endX}`;
  }
}

// ============================================================
// MOBILE LAYOUT (stacked per stage)
// ============================================================

const MOBILE_STAGES: { label: string; icon: React.ReactNode; numbers: number[] }[] = [
  {
    label: "Round of 32",
    icon: <Swords className="size-3.5" />,
    numbers: [...LEFT.R32, ...RIGHT.R32],
  },
  {
    label: "Round of 16",
    icon: <Swords className="size-3.5" />,
    numbers: [...LEFT.R16, ...RIGHT.R16],
  },
  {
    label: "Quarterfinals",
    icon: <Swords className="size-3.5" />,
    numbers: [...LEFT.QF, ...RIGHT.QF],
  },
  {
    label: "Semifinals",
    icon: <Swords className="size-3.5" />,
    numbers: [...LEFT.SF, ...RIGHT.SF],
  },
  {
    label: "Third place",
    icon: <Medal className="size-3.5" />,
    numbers: [103],
  },
  {
    label: "Final",
    icon: <Trophy className="size-3.5" />,
    numbers: [FINAL_NUM],
  },
];

function MobileBracket({
  cardProps,
  rowByNumber,
  champion,
}: {
  cardProps: (row: BracketRow) => CardProps;
  rowByNumber: Map<number, BracketRow>;
  champion: TeamLite | null;
}) {
  const [activeStage, setActiveStage] = useState(0);
  const stage = MOBILE_STAGES[activeStage];

  const stageRows = stage.numbers
    .map((n) => rowByNumber.get(n))
    .filter(Boolean) as BracketRow[];

  return (
    <div className="lg:hidden">
      {/* Stage tabs — horizontal scroll */}
      <div
        data-no-export
        className="sticky top-14 z-10 -mx-4 mb-4 overflow-x-auto border-b border-border/40 bg-background/90 px-4 py-2 backdrop-blur"
      >
        <div className="flex gap-1.5">
          {MOBILE_STAGES.map((s, idx) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setActiveStage(idx)}
              className={cn(
                "flex flex-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                idx === activeStage
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {stage.icon}
        <span>{stage.label}</span>
      </div>

      <ul className="flex flex-col gap-3">
        {stageRows.map((r) => (
          <li key={r.id}>
            <MatchCard
              {...cardProps(r)}
              variant={
                r.matchNumber === FINAL_NUM ? "final" : r.stage === "TP" ? "third" : undefined
              }
            />
          </li>
        ))}
      </ul>

      {stage.numbers.includes(FINAL_NUM) && champion && (
        <div className="mt-3 flex justify-center">
          <ChampionBanner champion={champion} />
        </div>
      )}

      {/* When exporting, include all stages regardless of active tab */}
    </div>
  );
}

// ============================================================
// MATCH CARD (shared)
// ============================================================

type CardProps = {
  row: BracketRow;
  field: FieldState;
  live: { home: TeamLite | null; away: TeamLite | null };
  onChange: (id: number, key: keyof FieldState, value: string) => void;
  prefs: DatePrefs;
};

function MatchCard({
  row,
  field,
  live,
  onChange,
  side,
  variant,
  prefs,
}: CardProps & {
  side?: "left" | "right";
  variant?: "final" | "third";
}) {
  const canEdit = !row.locked && !!live.home && !!live.away;

  const date = new Date(row.dateIso);
  const dateLabel = formatDate(date, prefs, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const homeNum = field.home === "" ? null : Number(field.home);
  const awayNum = field.away === "" ? null : Number(field.away);
  const isTie = homeNum !== null && awayNum !== null && homeNum === awayNum;

  const liveWinnerId: number | null = (() => {
    if (!live.home || !live.away) return null;
    if (homeNum === null || awayNum === null) return null;
    if (homeNum > awayNum) return live.home.id;
    if (homeNum < awayNum) return live.away.id;
    const wId = field.winner === "" ? null : Number(field.winner);
    if (wId === live.home.id || wId === live.away.id) return wId;
    return null;
  })();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card/90 backdrop-blur transition-colors",
        variant === "final"
          ? "border-primary/40 shadow-[0_0_32px_-8px_oklch(0.74_0.18_162/0.5)]"
          : "border-border/60 hover:border-primary/30",
        variant === "third" && "border-[color:var(--bronze)]/40",
      )}
    >
      {variant === "final" && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}

      <div className="flex items-center justify-between border-b border-border/40 bg-background/30 px-2 py-0.5 text-[9px] text-muted-foreground">
        <span className="font-mono font-semibold">#{row.matchNumber}</span>
        <span className="truncate">{dateLabel}</span>
      </div>

      <div className="divide-y divide-border/40">
        <TeamRow
          team={live.home}
          placeholder={row.homePlaceholder}
          inputName={`match-${row.id}-home`}
          value={field.home}
          onChange={(v) => onChange(row.id, "home", v)}
          disabled={!canEdit}
          isWinner={liveWinnerId !== null && live.home?.id === liveWinnerId}
          actualScore={row.actual?.homeScore ?? null}
        />
        <TeamRow
          team={live.away}
          placeholder={row.awayPlaceholder}
          inputName={`match-${row.id}-away`}
          value={field.away}
          onChange={(v) => onChange(row.id, "away", v)}
          disabled={!canEdit}
          isWinner={liveWinnerId !== null && live.away?.id === liveWinnerId}
          actualScore={row.actual?.awayScore ?? null}
        />
      </div>

      {live.home && live.away && canEdit && isTie && (
        <div className="border-t border-[color:var(--accent)]/40 bg-accent/10 px-2 py-0.5">
          <label className="flex items-center justify-between gap-1.5 text-[9px] font-medium text-accent-foreground/80">
            <span className="truncate uppercase tracking-wider">Tie → winner</span>
            <select
              name={`match-${row.id}-winner`}
              value={field.winner}
              onChange={(e) => onChange(row.id, "winner", e.target.value)}
              className="h-5 max-w-[88px] flex-1 rounded border border-border/60 bg-background px-1 text-[10px] text-foreground"
            >
              <option value="">—</option>
              <option value={live.home.id}>{live.home.code}</option>
              <option value={live.away.id}>{live.away.code}</option>
            </select>
          </label>
        </div>
      )}

      {row.actual ? (
        <div className="border-t border-border/40 bg-primary/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary">
          Final result
        </div>
      ) : row.locked ? (
        <div className="flex items-center gap-1 border-t border-border/40 bg-muted/30 px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
          <Lock className="size-2.5" />
          Locked
        </div>
      ) : null}

      {side && side === "right" ? null : null}
    </div>
  );
}

function TeamRow({
  team,
  placeholder,
  inputName,
  value,
  onChange,
  disabled,
  isWinner,
  actualScore,
}: {
  team: TeamLite | null;
  placeholder: string | null;
  inputName: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  isWinner: boolean;
  actualScore: number | null;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1.5 px-2 py-1 transition-colors",
        isWinner && "bg-primary/10",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {team ? (
          <>
            <Flag code={team.code} size="sm" />
            <span
              className={cn(
                "truncate font-display text-[13px] font-semibold leading-none",
                isWinner && "text-primary",
              )}
            >
              {team.code}
            </span>
          </>
        ) : (
          <>
            <div className="h-3.5 w-5 rounded-[2px] border border-dashed border-border/50 bg-muted/30" />
            <span className="truncate font-mono text-[10px] text-muted-foreground">
              {placeholder ?? "TBD"}
            </span>
          </>
        )}
      </div>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        max={20}
        name={inputName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-6 w-9 px-0 text-center text-[13px] font-semibold tabular-nums"
        aria-label={`Goals ${team?.code ?? placeholder ?? ""}`}
      />
      {actualScore !== null && (
        <span className="font-mono text-[9px] font-medium text-primary">
          ({actualScore})
        </span>
      )}
    </div>
  );
}

function ChampionBanner({ champion }: { champion: TeamLite }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-3 py-2">
      <Trophy className="size-4 text-[color:var(--gold)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)]">
        Your champion
      </span>
      <Flag code={champion.code} size="sm" />
      <span className="font-display text-sm font-semibold">{champion.code}</span>
    </div>
  );
}
