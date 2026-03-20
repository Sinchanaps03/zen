# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d761c61d-9e37-492c-91e6-e6e1d78cedb4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Start PostgreSQL with Docker (creates and seeds `instruments` table):
   `npm run db:up`
4. Run the API server:
   `npm run dev:api`
5. In a separate terminal, run the app:
   `npm run dev`

## SQL Database Setup

- Database engine: PostgreSQL 16 (via Docker Compose)
- SQL schema + seed file: `server/init.sql`
- API server: `server/index.js`
- DB connection helper: `server/db.js`

Useful commands:

- Start DB: `npm run db:up`
- Stop DB: `npm run db:down`
- Start API: `npm run dev:api`
- Refresh DB with new seed data: `docker compose down -v && docker compose up -d`

## Local Audio Files

- Add your premium tracks to `public/audio/`.
- The seeded instrument rows use local URLs like `/audio/shakuhachi-432hz.mp3`.
- After changing `server/init.sql`, refresh the DB volume:
   `docker compose down -v && docker compose up -d`
