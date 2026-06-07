"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMatchResult, type AdminActionState } from "@/lib/actions/admin";

type Match = {
  id: number;
  isKnockout: boolean;
  home: { id: number; code: string; name: string } | null;
  away: { id: number; code: string; name: string } | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: number | null;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
};

const INITIAL: AdminActionState = {};

export function MatchResultForm({ match }: { match: Match }) {
  const [state, formAction, pending] = useActionState(saveMatchResult, INITIAL);

  useEffect(() => {
    if (state.ok) toast.success("Result saved.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  const disabled = !match.home || !match.away;

  return (
    <form action={formAction} className="grid items-end gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
      <input type="hidden" name="matchId" value={match.id} />

      <div className="flex items-end gap-3">
        <ScoreInput
          id={`home-${match.id}`}
          name="homeScore"
          label={match.home?.code ?? "Home"}
          defaultValue={match.homeScore}
          disabled={disabled}
        />
        <div className="pb-1.5 text-muted-foreground">–</div>
        <ScoreInput
          id={`away-${match.id}`}
          name="awayScore"
          label={match.away?.code ?? "Away"}
          defaultValue={match.awayScore}
          disabled={disabled}
        />
      </div>

      {match.isKnockout && match.home && match.away && (
        <div className="space-y-2">
          <Label htmlFor={`winner-${match.id}`}>Winner (ET/pen if tied)</Label>
          <select
            id={`winner-${match.id}`}
            name="winnerId"
            defaultValue={match.winnerId ?? ""}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            <option value="">— None —</option>
            <option value={match.home.id}>{match.home.code}</option>
            <option value={match.away.id}>{match.away.code}</option>
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`status-${match.id}`}>Status</Label>
        <select
          id={`status-${match.id}`}
          name="status"
          defaultValue={match.status}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="LIVE">In Progress</option>
          <option value="FINISHED">Finished</option>
        </select>
      </div>

      <Button type="submit" disabled={pending || disabled} size="sm">
        {pending ? "..." : "Save"}
      </Button>
    </form>
  );
}

function ScoreInput({
  id,
  name,
  label,
  defaultValue,
  disabled,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: number | null;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input
        id={id}
        name={name}
        type="number"
        inputMode="numeric"
        min={0}
        max={20}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        className="h-10 w-16 text-center text-lg font-semibold tabular-nums"
      />
    </div>
  );
}
