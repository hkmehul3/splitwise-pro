# Deployment Guide

## Recommended: Vercel + Postgres

1. Push this repository to GitHub.
2. Create a hosted Postgres database. Good options: Vercel Postgres/Prisma Postgres, Neon, Supabase, Railway.
3. In Vercel, import the GitHub repository.
4. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL=https://your-domain.vercel.app`
5. Build command: `npm run build`
6. Install command: `npm install`
7. After first deploy, run migrations locally against production or from CI:

```bash
npx prisma migrate deploy
```

Vercel works well for this stack because it is the company behind Next.js and supports full-stack Next.js apps. Prisma's official Next.js guide also covers Prisma setup, migrations, and deploying to Vercel.

## Netlify

1. Push the code to GitHub.
2. In Netlify Dashboard, connect the repository.
3. Set build command: `npm run build`.
4. Set publish directory: `.next`.
5. Add environment variables in Site settings:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL=https://your-netlify-domain.netlify.app`
6. Deploy.

Netlify's current Next.js docs recommend connecting an existing Next.js app through the Netlify Dashboard. Netlify environment variables are managed from site settings and build contexts.

## Firebase

For this exact Next.js + Prisma app, use **Firebase App Hosting**, not classic static Firebase Hosting.

1. Create a Firebase project.
2. Enable Firebase App Hosting.
3. Connect your GitHub repository.
4. Add secrets/env variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
5. Deploy through App Hosting.

Firebase App Hosting has built-in support for Next.js and Angular dynamic web apps. Classic Firebase Hosting is best for static/SPAs unless paired with Cloud Functions or Cloud Run.

## Production checklist

- Use a managed PostgreSQL database with backups.
- Use a strong `NEXTAUTH_SECRET` generated with `openssl rand -base64 32`.
- Run `npx prisma migrate deploy` during release.
- Add monitoring: Vercel Analytics, Sentry, Logtail, or OpenTelemetry.
- Enable rate limiting for auth endpoints before public launch.
- Add OAuth providers such as Google after credentials auth is stable.
