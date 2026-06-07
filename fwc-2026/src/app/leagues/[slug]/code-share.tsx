"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LeagueCodeShare({
  leagueName,
  code,
  siteUrl,
}: {
  leagueName: string;
  code: string;
  siteUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const inviteText = `I invite you to my private pool "${leagueName}" for the 2026 World Cup.\n\nUse the code: ${code}\n\nGo to ${siteUrl}/leagues and enter the code to join.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the code");
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Pool "${leagueName}"`,
          text: inviteText,
        });
        return;
      } catch {
        // user cancelled or not supported
      }
    }
    // Fallback: copy invite text
    try {
      await navigator.clipboard.writeText(inviteText);
      toast.success("Invite copied to clipboard");
    } catch {
      toast.error("Could not share");
    }
  };

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Invite code
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2">
          <span className="font-mono text-lg font-bold tracking-[0.2em] text-primary">
            {code}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={copy}
            className="gap-1.5"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
        <Button type="button" onClick={share} variant="outline" size="sm" className="gap-1.5">
          <Share2 className="size-3.5" />
          Share invite
        </Button>
      </CardContent>
    </Card>
  );
}
