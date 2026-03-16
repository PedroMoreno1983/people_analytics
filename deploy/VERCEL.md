# DataWise People Analytics on Vercel

This project is ready to deploy on Vercel, but it must use an external PostgreSQL database.

Do not use the local SQLite demo database on Vercel.

## What Vercel will run

- `npm ci`
- `npm run vercel-build`

That build flow does:

1. `prisma generate`
2. `prisma migrate deploy`
3. `next build`

## Recommended database providers

- Neon
- Supabase Postgres
- Railway Postgres
- Managed PostgreSQL on your own cloud

## Environment variables

Set these in Vercel for Production, and ideally a separate `DATABASE_URL` for Preview:

- `DATABASE_URL`

These are optional but recommended:

- `NEXT_PUBLIC_APP_NAME`
- `BASIC_AUTH_USERNAME`
- `BASIC_AUTH_PASSWORD`

Use [.env.vercel.example](../.env.vercel.example) as the base.

## Deploy steps

1. Import the GitHub repo into Vercel.
2. Keep the project root as the repository root.
3. Add the environment variables above.
4. Trigger the first deployment.

If the database is reachable, Vercel will apply migrations during the build and deploy the app.

## Seed demo data

If you want the public Vercel environment to show demo companies and synthetic data, run the seed from your machine against the same hosted database:

```bash
DATABASE_URL="your-production-or-preview-db-url" npm run db:seed
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL="your-production-or-preview-db-url"
npm.cmd run db:seed
```

## Notes

- For Preview deployments, use a separate preview database when possible.
- If you keep Basic Auth enabled, the Vercel URL will stay protected for demos.
- File uploads work on Vercel, but imported data must persist to PostgreSQL, not to local disk.
