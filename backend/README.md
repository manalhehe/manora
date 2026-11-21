# MANORA API

## Local setup

1. From `backend/`, run `npm install`.
2. Copy `.env.example` to `.env` and set `JWT_SECRET` to a random value of at least 32 bytes. For example, generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.
3. Keep `FRONTEND_ORIGIN=http://localhost:5173` for the Vite development server.
4. Run `npm run dev`. The SQLite database is created at `backend/data/manora.sqlite` on first use.

The database path may be changed with `DATABASE_PATH`; relative paths resolve from the backend working directory. Back up the SQLite file before deploying or migrating data.

## Authentication

- `POST /api/auth/register` — validates and creates an account; responds `201`, or `400` for invalid fields and `409` for a duplicate email.
- `POST /api/auth/login` — responds `200` with the profile or `401` with a generic invalid-credentials message. `rememberMe: true` extends the session to 30 days; otherwise it lasts 2 hours.
- `GET /api/auth/me` — requires the session cookie and returns the authenticated profile; responds `401` when the session is missing or invalid.
- `POST /api/auth/logout` — clears the session cookie and responds `204`.

Access tokens are signed JWTs in an `HttpOnly`, `SameSite=Lax` cookie, scoped to `/api` so authenticated API routes under `/api/auth` and `/api/onboarding` receive it; they are not returned in JSON or stored in browser storage. The API only accepts the configured frontend origin for credentialed CORS and rejects cross-origin authentication and onboarding mutations. In production, set `NODE_ENV=production` to enable `Secure` cookies and serve over HTTPS. The frontend and API should share a site so `SameSite=Lax` cookies work.

## Commands

- `npm run dev` — start the API with watch mode.
- `npm run build` — type-check and compile to `dist/`.
- `npm test` — run auth integration tests against a temporary SQLite database.
