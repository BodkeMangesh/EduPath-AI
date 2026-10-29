# Software architecture

## Overview

EduPath AI is a browser-based single-page application backed by a JSON API. The client and API are built and deployed separately; MongoDB and AI/email providers are external runtime dependencies.

```text
Browser
  React 19 + React Router + Vite
       | HTTPS JSON requests (JWT bearer token)
       v
  Express 5 API (/api/v1)
       | Mongoose
       v
  MongoDB

Express API --> Groq API (AI-backed features)
Express API --> Gmail SMTP (welcome and password-reset email)
Browser/API --> API-host filesystem (resume uploads under /uploads)
```

## Repository boundaries

- `client/src/pages` contains the user-facing screens.
- `client/src/routes` and `client/src/App.jsx` define browser route guards and screens.
- `client/src/services` contains the client API calls; `client/src/api/axios.js` configures the API client and bearer-token header.
- `server/app.js` mounts Express middleware and API route groups.
- `server/routes` maps HTTP routes to controllers.
- `server/controllers` handles request/response behavior; `server/services` owns business operations.
- `server/models` defines MongoDB/Mongoose data models.
- `server/ai` and `server/intelligence` contain the AI provider and application recommendation logic.
- `server/middleware` contains authentication, upload, validation, and error handling.

## Request flow

1. The browser calls the API base configured by `VITE_API_URL`.
2. The Axios request interceptor attaches the stored JWT bearer token when present.
3. Express routes validate requests and apply authentication middleware where required.
4. Controllers invoke application services, which query MongoDB models and/or the configured AI or email provider.
5. The API returns JSON responses; uploaded resume files are served from `/uploads`.

## Runtime and deployment notes

- `server/server.js` loads environment variables, connects to MongoDB, and starts the HTTP server.
- The client is built into `client/dist`; the static host must support SPA history fallback.
- API CORS origins are controlled by `CLIENT_URL`.
- Resume uploads use local filesystem storage; persistent storage is needed on hosts with ephemeral disks.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the environment variable contract and deployment steps.
