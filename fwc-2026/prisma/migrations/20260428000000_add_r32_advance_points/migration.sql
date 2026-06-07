-- Add R32 advancement bonus to scoring config (FIFA 2026 has 32-team Round of 32).
ALTER TABLE "ScoringConfig" ADD COLUMN "pointsAdvanceR32" INTEGER NOT NULL DEFAULT 1;
