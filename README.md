# Splitwise Pro — Full-Stack Expense Sharing Platform

A production-ready upgrade of a single-file Splitwise-style prototype into a full-stack portfolio project with authentication, PostgreSQL database integration, protected APIs, group expenses, settlement tracking, comments, CSV export, and a recruiter-friendly GitHub structure.

## Why this project is ATS-worthy

This project demonstrates skills recruiters search for in Software Engineer, Backend Engineer, Full-Stack Engineer and Cloud roles:

- **Full-stack engineering:** Next.js App Router, React, TypeScript, API routes.
- **Backend/database:** Prisma ORM, PostgreSQL schema design, migrations, relational modeling.
- **Authentication:** NextAuth credential login, password hashing with bcrypt, protected dashboard/API access.
- **System design:** users, groups, memberships, expenses, equal splits, settlements, comments.
- **Production readiness:** environment variables, deployment guide, validation with Zod, seed data, CSV export.
- **Cloud deployment:** Vercel, Netlify, Firebase App Hosting deployment paths.

## Features

- Register/login with email and password
- Protected dashboard
- Group creation API
- Expense creation API
- Equal split calculation
- Settlement recording API
- Comments API
- Dashboard metrics: total groups, expenses, spending, balance
- CSV export
- PostgreSQL-ready Prisma schema
- Demo seed data

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, CSS |
| Backend | Next.js Route Handlers |
| Auth | NextAuth, bcryptjs |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Deployment | Vercel / Netlify / Firebase App Hosting |

## Folder Structure

```text
splitwise-pro/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── groups/
│   │   ├── expenses/
│   │   ├── settlements/
│   │   └── comments/
│   ├── dashboard/
│   ├── login/
│   ├── register/
│   ├── globals.css
│   └── layout.tsx
├── components/
├── lib/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
│   └── DEPLOYMENT.md
├── .env.example
├── package.json
└── README.md
```

## Local Setup

```bash
git clone <your-repo-url>
cd splitwise-pro
npm install
cp .env.example .env
```

Update `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/splitwise_pro?schema=public"
NEXTAUTH_SECRET="replace-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

Run database migration and seed demo data:

```bash
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

Demo login after seed:

```text
Email: harseet@example.com
Password: Password@123
```

## API Overview

### `POST /api/auth/register`
Creates a new user.

```json
{ "name": "Harseet Tiwari", "email": "harseet@example.com", "password": "Password@123" }
```

### `GET /api/groups`
Returns groups for the logged-in user.

### `POST /api/groups`
Creates a group.

```json
{ "name": "Goa Trip", "members": ["aarav@example.com"] }
```

### `POST /api/expenses`
Creates an expense and equal split rows.

```json
{
  "groupId": "group_id",
  "description": "Dinner",
  "amount": 2200,
  "category": "FOOD",
  "paidById": "user_id",
  "splitUserIds": ["user_1", "user_2"],
  "date": "2026-05-31"
}
```

### `POST /api/settlements`
Records a settlement.

```json
{ "groupId": "group_id", "fromUserId": "user_1", "toUserId": "user_2", "amount": 500 }
```

### `POST /api/comments`
Adds a comment to an expense.

```json
{ "expenseId": "expense_id", "body": "Paid by UPI" }
```

## Resume Bullet Points

- Built a production-ready expense sharing platform using Next.js, TypeScript, Prisma and PostgreSQL with secure authentication, protected APIs and relational data modeling.
- Designed group expense, split calculation, settlement and comment workflows, improving a static JavaScript prototype into a scalable full-stack application.
- Implemented Zod request validation, bcrypt password hashing, NextAuth sessions, CSV exports and deployment-ready environment configuration for Vercel/Netlify/Firebase.

## Future Improvements

- Add Google OAuth provider
- Add invite links and email notifications
- Add unequal split modes
- Add optimistic UI for CRUD modals
- Add Playwright/Cypress tests
- Add Dockerfile and CI/CD pipeline

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
