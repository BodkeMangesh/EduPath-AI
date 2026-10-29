# EduPath AI

EduPath AI is a career and learning guidance application. The repository contains a React/Vite web client and an Express/MongoDB API, with AI-assisted assessment, learning recommendations, and mentor chat.

## What is included

- Account registration, login, password reset, and onboarding
- Career discovery, career selection, and career readiness
- Skill assessments, learning roadmaps, sessions, and progress tracking
- Resume analysis, placement preparation, learning resources, and notifications
- An AI mentor and a MongoDB-backed API

See [docs/FEATURES.md](./docs/FEATURES.md) for the application routes and implemented API areas. See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for local setup and production deployment.

## Requirements

- Node.js 20.19 or newer (or Node.js 22.12 or newer)
- npm
- A MongoDB database
- A Groq API key for AI-powered features

Email credentials are needed for password reset email delivery. They are optional for starting the API.

## Run locally (Windows PowerShell)

1. Configure the API:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

   Edit `server\.env` and set at least `MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`, and `CLIENT_URL`. Configure `EMAIL_USER`, `EMAIL_PASSWORD`, and `FRONTEND_URL` to enable password reset email.

2. Configure the client:

   ```powershell
   Copy-Item client\.env.example client\.env
   ```

   `VITE_API_URL` should point to the API's `/api/v1` base URL. The example uses the local API address.

3. Install and start the API in one terminal:

   ```powershell
   Set-Location server
   npm ci
   npm run dev
   ```

4. Install and start the client in another terminal:

   ```powershell
   Set-Location client
   npm ci
   npm run dev
   ```

   Open the Vite URL printed in the client terminal (normally `http://localhost:5173`). The API health check is at `http://localhost:5000/api/v1/health`, and interactive API docs are at `http://localhost:5000/api-docs`.

The application expects career records to exist in MongoDB. There is no configured database seed command in the current package scripts; see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md#database-and-initial-data).

## Build the web client

```powershell
Set-Location client
npm ci
npm run build
```

The production files are written to `client/dist`. The API is started separately with `npm start` from the `server` directory.

## Project layout

```text
client/   React, React Router, and Vite application
server/   Express API, MongoDB models, AI integrations, and uploads
docs/     Deployment, feature, API, architecture, and data-model documentation
```

## Current validation notes

- The client production build is the available frontend build check.
- The server package currently has a placeholder `test` script and no configured automated test suite.
- Deployment requires external MongoDB, AI, and (for password reset) email configuration; those hosted integrations are not verified by a local build.

