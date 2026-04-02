# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LinguaLife is a language learning platform. Monorepo using npm workspaces with two apps under `apps/`.

## Commands

```bash
# Install all dependencies (run from root)
npm install

# Web app (Next.js 16 + React 19) — main platform
cd apps/web && npm run dev       # dev server on :3000
cd apps/web && npm run build     # production build
cd apps/web && npm run start     # start production server

# Curator app (React 18 + Vite 6) — content curation tool
cd apps/curator && npm run dev   # dev server on :5173
cd apps/curator && npm run build # tsc + vite build

# Type-check
cd apps/web && npx tsc --noEmit
cd apps/curator && npx tsc --noEmit
```

## Architecture

### Web App (`apps/web`)

Next.js 16 using **Pages Router** (not App Router):
- `pages/` — routes (`index.tsx`, `dashboard.tsx`, `classroom.tsx`, `student.tsx`, `admin.tsx`, etc.)
- `pages/api/` — API routes (Airtable CRUD, AI chat, session management, registration, admin)
- `components/` — React components with CSS Modules (`*.module.css`)
- `context/AppContext.tsx` — global app state via React Context
- `lib/` — server utilities (Airtable client, holidays, stories, scout)
- `types/` — TypeScript type definitions
- `hooks/` — custom React hooks

Key integrations:
- **Airtable** as the database (via REST API in `lib/airtable.ts`)
- **Google Gemini** for AI features (`@google/generative-ai`)
- **YouTube transcript** extraction for video content

Environment variables (`apps/web/.env.local`): `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `GEMINI_API_KEY`. All server-side only (used in `pages/api/`).

Deployed to **Vercel**.

### Curator App (`apps/curator`)

React SPA for processing PDFs and organizing learning content. Uses `pdfjs-dist` for PDF extraction.

## Important: Next.js 16

This project uses Next.js 16 which has breaking changes from earlier versions. **Always read `node_modules/next/dist/docs/` before writing Next.js code.** Do not assume APIs or conventions match your training data.

## Documentation

Spanish-language project docs in `_docs_md/` cover requirements, pedagogy architecture, and project status.
