# MANORA frontend

## Local development

1. Start the API from `backend/` with `npm run dev`.
2. Start this app from `frontend/` with `npm run dev`.
3. Open the Vite URL (normally `http://localhost:5173`). Requests to `/api` are proxied to the API on port `5000`.

The app includes the MANORA landing page, registration, login, a protected welcome page, sign-out, and a password-recovery notice. Session state is restored from the API's HttpOnly cookie; no token is stored in browser storage.

## Commands

- `npm run dev` — start Vite.
- `npm run build` — type-check and create a production build.
- `npm run lint` — run ESLint.
- `npm run preview` — preview the production build.
