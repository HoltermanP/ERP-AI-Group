# AI-Group ERP

Intern ERP-systeem voor AI-Group.nl — klantbeheer, offertes en facturen.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **Clerk** — authenticatie
- **Neon** — PostgreSQL database
- **Drizzle ORM** — database schema & queries
- **Vercel Blob** — bestandsopslag
- **Tailwind CSS** — styling
- **@react-pdf/renderer** — PDF generatie

## Setup

### 1. Installeer dependencies

```bash
npm install
```

### 2. Environment variabelen

Kopieer `.env.example` naar `.env.local` en vul in:

```bash
cp .env.example .env.local
```

| Variabele | Beschrijving |
|-----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token |

### 3. Database setup

```bash
npm run db:push
```

### 4. Seed data (optioneel)

```bash
npm run seed
```

### 5. Dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy naar Vercel

```bash
vercel deploy
```

Stel environment variabelen in via het Vercel dashboard.

## Database scripts

```bash
npm run db:studio    # Drizzle Studio
npm run db:generate  # Migraties genereren
npm run db:push      # Schema pushen
```

## Modules

- **Dashboard** `/dashboard` — KPI overzicht, recente activiteit
- **Klanten** `/customers` — CRM + contacthistorie
- **Contacten** `/contacts` — Alle contactmomenten en follow-ups
- **Offertes** `/quotes` — Regeleditor + PDF export
- **Facturen** `/invoices` — Betaalstatus + PDF export
- **Instellingen** `/settings` — Bedrijfsprofiel

## PDF API

- `GET /api/pdf/quote/[id]` — Offerte PDF downloaden
- `GET /api/pdf/invoice/[id]` — Factuur PDF downloaden
