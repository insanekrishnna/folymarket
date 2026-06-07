"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Clock, Lock, Save } from "lucide-react";
import { BallSpinner } from "@/components/brand";
import { fireConfetti } from "@/lib/confetti";
import {
  saveGroupPredictions,
  type SavePredictionsState,
} from "@/lib/actions/predictions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flag } from "@/components/flag";
import { formatDate } from "@/lib/datetime";
import type { DatePrefs } from "@/lib/timezone";

type MatchRow = {
  id: number;
  matchNumber: number;
  dateIso: string;
  venue: string;
  city: string;
  homeTeam: { code: string; name: string } | null;
  awayTeam: { code: string; name: string } | null;
  prediction: { homeScore: number; awayScore: number } | null;
  locked: boolean;
  actual: { homeScore: number; awayScore: number } | null;
};

const INITIAL: SavePredictionsState = {};

export function GroupPredictionsForm({
  matches,
  prefs,
}: {
  matches: MatchRow[];
  prefs: DatePrefs;
}) {
  const [state, formAction, pending] = useActionState(
    saveGroupPredictions,
    INITIAL,
  );

  useEffect(() => {
    if (state.ok && state.savedCount !== undefined) {
      if (state.savedCount === 0) toast.info("No changes to save.");
      else {
        toast.success(
          `Saved (${state.savedCount} ${state.savedCount === 1 ? "match" : "matches"}).`,
        );
        fireConfetti();
      }
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <ul className="space-y-3">
        {matches.map((m) => (
          <MatchRowItem key={m.id} match={m} prefs={prefs} />
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/60 p-3">
        <p className="text-xs text-muted-foreground">
          Save before each match starts.
        </p>
        <Button type="submit" disabled={pending} className="gap-1.5">
          {pending ? (
            <BallSpinner className="size-3.5" />
          ) : (
            <Save className="size-3.5" />
          )}
          {pending ? "Saving..." : "Save Predictions"}
        </Button>
      </div>
    </form>
  );
}

function MatchRowItem({
  match,
  prefs,
}: {
  match: MatchRow;
  prefs: DatePrefs;
}) {
  const date = new Date(match.dateIso);
  const dateLabel = formatDate(date, prefs, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const disabled = match.locked || !match.homeTeam || !match.awayTeam;

  return (
    <li className="overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/50 bg-background/30 px-4 py-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-foreground/80">
            #{match.matchNumber}
          </span>
          <span className="opacity-50">·</span>
          <Clock className="size-3" />
          <span className="capitalize">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.actual ? (
            <Badge variant="default" className="tabular-nums">
              Final {match.actual.homeScore}–{match.actual.awayScore}
            </Badge>
          ) : match.locked ? (
            <Badge variant="outline" className="gap-1">
              <Lock className="size-3" />
              Locked
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-4 sm:gap-4">
        <TeamSide align="end" team={match.homeTeam} />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            name={`match-${match.id}-home`}
            defaultValue={match.prediction?.homeScore ?? ""}
            disabled={disabled}
            className="h-12 w-14 text-center text-lg font-semibold tabular-nums"
            aria-label={`Goals ${match.homeTeam?.code ?? "home"}`}
          />
          <span className="font-display text-xl text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            name={`match-${match.id}-away`}
            defaultValue={match.prediction?.awayScore ?? ""}
            disabled={disabled}
            className="h-12 w-14 text-center text-lg font-semibold tabular-nums"
            aria-label={`Goals ${match.awayTeam?.code ?? "away"}`}
          />
        </div>
        <TeamSide align="start" team={match.awayTeam} />
      </div>
    </li>
  );
}

function TeamSide({
  align,
  team,
}: {
  align: "start" | "end";
  team: { code: string; name: string } | null;
}) {
  const isEnd = align === "end";
  return (
    <div
      className={`flex items-center gap-2.5 ${isEnd ? "justify-end" : "justify-start"}`}
    >
      {isEnd && team && <TeamText code={team.code} name={team.name} align="end" />}
      {team ? (
        <Flag code={team.code} size="lg" />
      ) : (
        <div className="h-6 w-9 rounded-[2px] border border-dashed border-border/50 bg-muted/30" />
      )}
      {!isEnd && team && <TeamText code={team.code} name={team.name} align="start" />}
    </div>
  );
}

function TeamText({
  code,
  name,
  align,
}: {
  code: string;
  name: string;
  align: "start" | "end";
}) {
  return (
    <div className={align === "end" ? "text-right" : "text-left"}>
      <div className="font-display text-base font-semibold leading-tight">
        {code}
      </div>
      <div className="text-[11px] text-muted-foreground">{name}</div>
    </div>
  );
}
