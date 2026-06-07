<div align="center">

<img src="public/icon.png" alt="World Cup 2026 Predictions" width="128" />

# World Cup 2026 Predictions

**Predict the FIFA World Cup 2026, build your bracket and compete with your friends.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)

</div>

---

## 📖 About the Project

**World Cup 2026 Predictions** is a multiplayer web application (pool/prediction game) to predict the FIFA World Cup 2026 (USA · Canada · Mexico). Participants predict scores for all 104 matches, build their knockout bracket, and compete for the top ranking.

Designed for playing **with friends**, with a transparent scoring system and a football-inspired design centered on the tournament experience.

## ✨ Features

- ⚽ **Match predictions** for all 104 matches (12 groups of 4 + knockout stages).
- 🏆 **Knockout bracket** generated from your predictions (Round of 32 → Final).
- 🎖️ **Individual awards**: Top Scorer, Top Assist, Best Player, Best Goalkeeper, Champion and Runner-up.
- 📊 **Live leaderboard** with transparent scoring system visible to users.
- 🗓️ **Official calendar** with venues, times and timezones.
- 🔐 **Authentication** with username and password (NextAuth).
- ⚙️ **Admin panel** for tournament results and awards.
- 🌎 **SEO optimized** (OpenGraph, sitemap, robots, JSON-LD SportsEvent).
- 🎨 **Dark-first design** inspired by the 2026 World Cup visual identity.

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| UI | [React 19](https://react.dev) · [Tailwind CSS 4](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com) |
| Database | [PostgreSQL 17](https://www.postgresql.org) |
| ORM | [Prisma 7](https://www.prisma.io) |
| Authentication | [NextAuth v5](https://authjs.dev) + Prisma Adapter |
| Validation | [Zod 4](https://zod.dev) |
| Icons | [lucide-react](https://lucide.dev) · [flag-icons](https://flagicons.lipis.dev) |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 17 running locally or remotely
- **npm** (or `pnpm` / `yarn` / `bun`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/DavidSepulvedaCh/FWC_2026.git
cd FWC_2026

# 2. Install dependencies (triggers prisma generate in postinstall)
npm install

# 3. Copy environment variables and adjust them
cp .env.example .env

# 4. Apply migrations
npm run db:migrate

# 5. Populate with official FIFA data (teams, groups, schedule)
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Prisma). |
| `NEXT_PUBLIC_SITE_URL` | Canonical public site URL, without trailing slash. Used for SEO metadata, `sitemap.xml`, `robots.txt` and OpenGraph. |

See [.env.example](.env.example) as a template.

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload. |
| `npm run build` | Build the application for production. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint on the project. |
| `npm run db:migrate` | Apply Prisma migrations in development. |
| `npm run db:push` | Sync schema with database without migrations. |
| `npm run db:studio` | Open Prisma Studio to inspect the database. |
| `npm run db:seed` | Load official FIFA data (teams, groups, matches). |

## 🗂️ Project Structure

```
src/
├── app/                   # Routes (App Router)
│   ├── admin/             # Admin panel
│   ├── api/               # Route handlers (NextAuth, etc.)
│   ├── fixtures/          # Match schedule
│   ├── predictions/       # User predictions and bracket
│   ├── ranking/           # Leaderboard
│   ├── login/ · register/ # Authentication
│   ├── settings/          # User preferences
│   ├── opengraph-image.tsx  # Dynamic OG image
│   ├── icon.png · apple-icon.png
│   ├── robots.ts · sitemap.ts
│   └── layout.tsx · page.tsx
├── components/            # Reusable UI components
├── lib/                   # Utilities (prisma, session, datetime, ...)
└── types/                 # Shared types

prisma/
├── schema.prisma          # Data model
├── migrations/            # Versioned migrations
├── seed.ts                # Seed script
└── fifa-data.ts           # Official FIFA 2026 data
```

## 🚢 Deployment

The application is optimized for [Vercel](https://vercel.com/new), but runs on any Node.js-compatible platform.

1. Provision a PostgreSQL database (Neon, Supabase, Railway, etc.).
2. Configure `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` in the production environment.
3. Run `prisma migrate deploy` as a pre-build step.
4. `npm run build && npm start`.

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome via [Issues](../../issues) or Pull Requests.

## 📄 License

Distributed under the **MIT** license. See `LICENSE` for more information.

---

<div align="center">

*"FIFA", "FIFA World Cup" and associated trademarks are property of FIFA. This project is not officially affiliated with or endorsed by FIFA.*

</div>
