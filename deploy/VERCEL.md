# DataWise People Analytics on Vercel

This project is ready to deploy on Vercel, and the recommended setup is Vercel + Supabase Postgres.

Do not use the local SQLite demo database on Vercel.

## What Vercel will run

- `npm ci`
- `npm run vercel-build`

That build flow does:

1. `prisma generate`
2. `prisma migrate deploy`
3. `next build`

## Recommended database provider

- Supabase Postgres

This repo is configured for the common Supabase split:

- `DATABASE_URL`: transaction pooler for the running app
- `DIRECT_URL`: direct or session connection for Prisma CLI and migrations

## Environment variables

Set these in Vercel for Production, and ideally a separate `DATABASE_URL` for Preview:

- `DATABASE_URL`
- `DIRECT_URL`

These are optional but recommended:

- `NEXT_PUBLIC_APP_NAME`
- `BASIC_AUTH_USERNAME`
- `BASIC_AUTH_PASSWORD`

Use [.env.vercel.example](../.env.vercel.example) as the base.

## How to map Supabase values

In Supabase, open `Connect` and copy:

1. The `Transaction pooler` string for `DATABASE_URL`
2. The `Direct connection` string, or `Session pooler` on port `5432`, for `DIRECT_URL`

For Prisma, keep the pooled URL with `pgbouncer=true&connection_limit=1`.

## Deploy steps

1. Import the GitHub repo into Vercel.
2. Keep the project root as the repository root.
3. Add the environment variables above.
4. Trigger the first deployment.

If the database is reachable, Vercel will apply migrations during the build and deploy the app.

## Seed demo data

If you want the public Vercel environment to show demo companies and synthetic data, run the seed from your machine against the same hosted database:

```bash
DATABASE_URL="your-supabase-pooler-url" DIRECT_URL="your-supabase-direct-url" npm run db:seed
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL="your-supabase-pooler-url"
$env:DIRECT_URL="your-supabase-direct-url"
npm.cmd run db:seed
```

## Notes

- For Preview deployments, use a separate Supabase project or database branch when possible.
- If you keep Basic Auth enabled, the Vercel URL will stay protected for demos.
- File uploads work on Vercel, but imported data must persist to PostgreSQL, not to local disk.
