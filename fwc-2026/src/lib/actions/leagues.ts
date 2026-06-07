"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type LeagueActionState = {
  ok?: boolean;
  error?: string;
  redirectTo?: string;
};

const nameSchema = z
  .string()
  .trim()
  .min(3, "Minimum 3 characters.")
  .max(40, "Maximum 40 characters.");

const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(4, "Code too short.")
  .max(12, "Code too long.");

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function randomCode() {
  // 8 chars, no ambiguous (O/0, I/1)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export async function createLeagueAction(
  _prev: LeagueActionState,
  formData: FormData,
): Promise<LeagueActionState> {
  const user = await requireUser();

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const name = parsed.data;

  const baseSlug = slugify(name) || "league";

  // Race-safe creation: rely on unique constraints (slug, code) and retry
  // with fresh suffixes if either collides. P2002 = Prisma unique constraint.
  const MAX_ATTEMPTS = 10;
  let createdSlug: string | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const slug =
      attempt === 0
        ? baseSlug
        : `${baseSlug}-${Math.floor(Math.random() * 9999)}`;
    const code = randomCode();
    try {
      const league = await prisma.league.create({
        data: {
          name,
          slug,
          code,
          ownerId: user.id,
          members: { create: { userId: user.id } },
        },
      });
      createdSlug = league.slug;
      break;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        continue; // collision on slug or code, retry
      }
      throw err;
    }
  }

  if (!createdSlug) {
    return {
      error: "Could not create league. Try another name.",
    };
  }

  revalidatePath("/leagues");
  redirect(`/leagues/${createdSlug}`);
}

export async function joinLeagueAction(
  _prev: LeagueActionState,
  formData: FormData,
): Promise<LeagueActionState> {
  const user = await requireUser();

  const parsed = codeSchema.safeParse(formData.get("code"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const code = parsed.data;

  const league = await prisma.league.findUnique({ where: { code } });
  if (!league) return { error: "League with that code not found." };

  const existing = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId: league.id, userId: user.id } },
  });
  if (existing) {
    return { ok: true, redirectTo: `/leagues/${league.slug}` };
  }

  await prisma.leagueMember.create({
    data: { leagueId: league.id, userId: user.id },
  });

  revalidatePath("/leagues");
  revalidatePath(`/leagues/${league.slug}`);
  return { ok: true, redirectTo: `/leagues/${league.slug}` };
}

export async function leaveLeagueAction(formData: FormData) {
  const user = await requireUser();
  const leagueId = String(formData.get("leagueId") ?? "");
  if (!leagueId) return;

  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) return;

  if (league.ownerId === user.id) {
    // Owner cannot leave; must delete.
    return;
  }

  await prisma.leagueMember.deleteMany({
    where: { leagueId, userId: user.id },
  });
  revalidatePath("/leagues");
  redirect("/leagues");
}

export async function deleteLeagueAction(formData: FormData) {
  const user = await requireUser();
  const leagueId = String(formData.get("leagueId") ?? "");
  if (!leagueId) return;

  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league || league.ownerId !== user.id) return;

  await prisma.league.delete({ where: { id: leagueId } });
  revalidatePath("/leagues");
  redirect("/leagues");
}
