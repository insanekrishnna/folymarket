"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { recomputeScoresAction, type AdminActionState } from "@/lib/actions/admin";

const INITIAL: AdminActionState = {};

export function RecomputeButton() {
  const [state, formAction, pending] = useActionState(recomputeScoresAction, INITIAL);

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <Button type="submit" disabled={pending}>
        {pending ? "Calculating..." : "Recalculate now"}
      </Button>
    </form>
  );
}
