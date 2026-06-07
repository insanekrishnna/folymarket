"use client";

import { LogOut, Trash2 } from "lucide-react";
import { deleteLeagueAction, leaveLeagueAction } from "@/lib/actions/leagues";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LeagueAdminActions({
  leagueId,
  isOwner,
}: {
  leagueId: string;
  isOwner: boolean;
}) {
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {isOwner ? "Administration" : "Membership"}
        </div>

        {isOwner ? (
          <form
            action={deleteLeagueAction}
            onSubmit={(e) => {
              if (
                !confirm(
                  "Are you sure you want to delete this league? This action cannot be undone.",
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="leagueId" value={leagueId} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              Delete league
            </Button>
          </form>
        ) : (
          <form
            action={leaveLeagueAction}
            onSubmit={(e) => {
              if (!confirm("Leave this league?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="leagueId" value={leagueId} />
            <Button type="submit" variant="outline" size="sm" className="w-full gap-1.5">
              <LogOut className="size-3.5" />
              Leave league
            </Button>
          </form>
        )}

        <p className="text-[11px] text-muted-foreground">
          {isOwner
            ? "As an admin you can delete the league. Members can leave whenever they want."
            : "If you leave you lose access to the private leaderboard. You can rejoin with the code."}
        </p>
      </CardContent>
    </Card>
  );
}
