# DataWise People Analytics Platform

Phase 1 of the MVP based on the `datawise_codex_package_v2` spec package.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-compatible UI primitives
- Prisma + PostgreSQL
- Zod

## Phase 1 Scope

- app scaffold
- advanced Prisma schema
- seed script
- placeholder routes for dashboard, departments and upload
- health endpoint

## Setup

1. Copy `.env.example` to `.env`.
2. Update `DATABASE_URL` for your PostgreSQL instance.
3. Install dependencies with `npm install`.
4. Run `npm run db:generate`.
5. Run `npm run db:push`.
6. Run `npm run db:seed`.
7. Run `npm run dev`.

## Routes

- `/`
- `/dashboard`
- `/departments`
- `/upload`
- `/api/health`
