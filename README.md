# CatatanHewanku

Monorepo for a web app with a React frontend and an Express backend.

## Structure

```text
backend/   Express API and server code
frontend/  React app built with Vite
```

## Team workflow

- Keep `main` stable and deployable.
- Use `backend-dev` for backend work.
- Use `frontend-dev` for frontend work.
- Merge into `main` only through pull requests.
- Pull changes from `main` often to avoid drift.

## Running locally

- Backend: run commands inside `backend/`
- Frontend: run commands inside `frontend/`

## Shared rule

Agree on API routes and response shapes before connecting the frontend to the backend.
