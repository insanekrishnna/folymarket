-- AlterTable
ALTER TABLE "ActualAwards" ADD COLUMN     "bestGoalkeeperName" TEXT,
ADD COLUMN     "bestPlayerName" TEXT,
ADD COLUMN     "topAssistName" TEXT,
ADD COLUMN     "topScorerName" TEXT;

-- AlterTable
ALTER TABLE "SpecialPrediction" ADD COLUMN     "bestGoalkeeperName" TEXT,
ADD COLUMN     "bestPlayerName" TEXT,
ADD COLUMN     "topAssistName" TEXT,
ADD COLUMN     "topScorerName" TEXT;
