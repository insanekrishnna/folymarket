import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { MATCHES, TEAMS } from "./fifa-data";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Define it in .env before running the seed.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding FIFA World Cup 2026 data...\n");

  await prisma.scoringConfig.upsert({
    where: { singleton: true },
    create: { singleton: true },
    update: {},
  });
  await prisma.actualAwards.upsert({
    where: { singleton: true },
    create: { singleton: true },
    update: {},
  });
  console.log("OK Singletons (ScoringConfig, ActualAwards) ready");

  const groupLetters = [...new Set(TEAMS.map((t) => t.group))].sort();
  for (const letter of groupLetters) {
    await prisma.group.upsert({
      where: { letter },
      create: { letter },
      update: {},
    });
  }
  const groups = await prisma.group.findMany();
  const groupIdByLetter = new Map(groups.map((g) => [g.letter, g.id]));
  console.log(`OK ${groups.length} groups created`);

  for (const t of TEAMS) {
    const groupId = groupIdByLetter.get(t.group);
    if (!groupId) throw new Error(`Group ${t.group} not found for team ${t.code}`);
    await prisma.team.upsert({
      where: { code: t.code },
      create: {
        code: t.code,
        name: t.name,
        confederation: t.confederation,
        groupId,
      },
      update: {
        name: t.name,
        confederation: t.confederation,
        groupId,
      },
    });
  }
  const teams = await prisma.team.findMany();
  const teamIdByCode = new Map(teams.map((t) => [t.code, t.id]));
  console.log(`OK ${teams.length} teams created`);


  let groupMatchCount = 0;
  let knockoutMatchCount = 0;
  for (const m of MATCHES) {
    const groupId = m.group ? groupIdByLetter.get(m.group) ?? null : null;
    const homeTeamId = teamIdByCode.get(m.home) ?? null;
    const awayTeamId = teamIdByCode.get(m.away) ?? null;
    const homePlaceholder = homeTeamId ? null : m.home;
    const awayPlaceholder = awayTeamId ? null : m.away;

    await prisma.match.upsert({
      where: { matchNumber: m.matchNumber },
      create: {
        matchNumber: m.matchNumber,
        stage: m.stage,
        groupId,
        date: new Date(m.date),
        venue: m.venue,
        city: m.city,
        country: m.country,
        homeTeamId,
        awayTeamId,
        homePlaceholder,
        awayPlaceholder,
      },
      update: {
        stage: m.stage,
        groupId,
        date: new Date(m.date),
        venue: m.venue,
        city: m.city,
        country: m.country,
        homeTeamId,
        awayTeamId,
        homePlaceholder,
        awayPlaceholder,
      },
    });

    if (m.stage === "GROUP") groupMatchCount++;
    else knockoutMatchCount++;
  }
  console.log(`OK ${groupMatchCount} group matches + ${knockoutMatchCount} knockout matches created`);

  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    create: {
      username: "admin",
      name: "Administrator",
      passwordHash: adminHash,
      role: "ADMIN",
    },
    update: {},
  });
  console.log(`OK Admin user ready (username: admin, password: ${adminPassword === "changeme" ? "changeme - CHANGE THIS" : "from ADMIN_PASSWORD"})`);

  console.log("\nSeed completed successfully.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
