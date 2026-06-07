"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Goal, Save, Shield, Star, Trophy, UserRound } from "lucide-react";
import { BallSpinner } from "@/components/brand";
import { fireConfetti } from "@/lib/confetti";
import {
  saveSpecialPredictions,
  type SaveSpecialState,
} from "@/lib/actions/predictions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flag } from "@/components/flag";

type TeamOption = {
  id: number;
  code: string;
  name: string;
  groupLetter: string;
};

type Existing = {
  topScorerName: string | null;
  topAssistName: string | null;
  bestPlayerName: string | null;
  bestGoalkeeperName: string | null;
  championId: number | null;
  runnerUpId: number | null;
} | null;

const INITIAL: SaveSpecialState = {};

export function SpecialForm({
  teams,
  existing,
  locked,
}: {
  teams: TeamOption[];
  existing: Existing;
  locked: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveSpecialPredictions,
    INITIAL,
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Predictions saved.");
      fireConfetti();
    } else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-primary/20 bg-card/70 backdrop-blur">
        <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
          <Trophy className="size-4 text-primary" />
          <CardTitle className="text-base">Champion and Runner-up</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <TeamSelect
            id="championId"
            label="World Cup Champion"
            teams={teams}
            defaultValue={existing?.championId ?? null}
            disabled={locked}
            highlight
          />
          <TeamSelect
            id="runnerUpId"
            label="Runner-up"
            teams={teams}
            defaultValue={existing?.runnerUpId ?? null}
            disabled={locked}
          />
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur">
        <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
          <Star className="size-4 text-[color:var(--gold)]" />
          <CardTitle className="text-base">Individual Awards</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <PlayerField
            id="topScorerName"
            label="Top Scorer"
            icon={<Goal className="size-3.5" />}
            placeholder="E.g. Kylian Mbappe"
            defaultValue={existing?.topScorerName ?? ""}
            disabled={locked}
          />
          <PlayerField
            id="topAssistName"
            label="Top Assist"
            icon={<UserRound className="size-3.5" />}
            placeholder="E.g. Pedri Gonzalez"
            defaultValue={existing?.topAssistName ?? ""}
            disabled={locked}
          />
          <PlayerField
            id="bestPlayerName"
            label="Best Player"
            icon={<Star className="size-3.5" />}
            placeholder="E.g. Lionel Messi"
            defaultValue={existing?.bestPlayerName ?? ""}
            disabled={locked}
          />
          <PlayerField
            id="bestGoalkeeperName"
            label="Best Goalkeeper"
            icon={<Shield className="size-3.5" />}
            placeholder="E.g. Thibaut Courtois"
            defaultValue={existing?.bestGoalkeeperName ?? ""}
            disabled={locked}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/60 p-3">
        <p className="text-xs text-muted-foreground">
          You can edit until the final match starts.
        </p>
        <Button type="submit" disabled={pending || locked} className="gap-1.5">
          {pending ? (
            <BallSpinner className="size-3.5" />
          ) : (
            <Save className="size-3.5" />
          )}
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

function TeamSelect({
  id,
  label,
  teams,
  defaultValue,
  disabled,
  highlight,
}: {
  id: string;
  label: string;
  teams: TeamOption[];
  defaultValue: number | null;
  disabled: boolean;
  highlight?: boolean;
}) {
  const [value, setValue] = useState<number | "">(defaultValue ?? "");
  const selected = teams.find((t) => t.id === value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        {highlight && <Trophy className="size-3.5 text-[color:var(--gold)]" />}
        {label}
      </Label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
        disabled={disabled}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">— Not selected —</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.code}, Group {t.groupLetter})
          </option>
        ))}
      </select>
      {selected && (
        <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5">
          <Flag code={selected.code} size="sm" />
          <span className="font-mono text-[11px] font-semibold">
            {selected.code}
          </span>
          <span className="text-sm">{selected.name}</span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            Group {selected.groupLetter}
          </span>
        </div>
      )}
    </div>
  );
}

function PlayerField({
  id,
  label,
  icon,
  placeholder,
  defaultValue,
  disabled,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  placeholder?: string;
  defaultValue: string;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        maxLength={80}
      />
    </div>
  );
}
