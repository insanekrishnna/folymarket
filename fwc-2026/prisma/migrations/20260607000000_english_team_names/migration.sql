-- Remove the legacy Spanish team-name column by renaming it only when an
-- existing database still has "nameEs" and does not already have "name".
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Team'
      AND column_name = 'nameEs'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Team'
      AND column_name = 'name'
  ) THEN
    ALTER TABLE "Team" RENAME COLUMN "nameEs" TO "name";
  END IF;
END $$;
