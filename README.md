# Context Ops

A web application that converts the real context of a person or small business into actionable development decisions. It helps capture information about their environment, detect problems/opportunities, prioritize them, convert them into a backlog, and generate technical specifications ready for execution.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + custom shadcn-style components
- **Backend**: Next.js API Route Handlers
- **Database**: PostgreSQL with Prisma 7
- **Auth**: NextAuth.js (credentials provider)
- **Validation**: Zod + React Hook Form
- **AI Layer**: Mocked spec generator (ready for OpenAI swap)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running at `localhost:5432`

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contextops"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. Push the database schema:
   ```bash
   npx prisma db push
   ```

4. Seed the database:
   ```bash
   npx prisma db seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) and log in with:
- **Email**: `ops@contextops.dev`
- **Password**: `contextops2024`

## Features

- **Contexts**: Capture comprehensive information about a person or business environment
- **Evidences**: Attach links, notes, observations, findings, and ideas to contexts
- **Opportunities**: Identify and score opportunities using a configurable priority formula
- **Backlog**: Convert opportunities into development tasks with effort sizing and status tracking
- **MVP Specs**: Auto-generate technical specification documents from opportunities
- **Settings**: Configure scoring weights for the priority formula

## Priority Scoring Formula

```
Score = (Impact × w₁) + (Urgency × w₂) + (Confidence × w₃) + (Pain × w₄) − (Effort × w₅)
```

Default weights: Impact 0.35, Urgency 0.20, Confidence 0.15, Pain 0.20, Effort 0.10

## Architecture

See `src/` for the full application structure:
- `app/` — Next.js App Router pages and API routes
- `components/` — UI and feature components
- `lib/` — Database client, auth config, validations, AI layer, utilities
- `types/` — Shared TypeScript types
- `prisma/` — Schema and seed data
