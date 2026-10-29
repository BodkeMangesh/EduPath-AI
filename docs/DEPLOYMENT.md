# Deployment and local setup

EduPath AI is deployed as two applications: a static Vite client and a Node.js/Express API. MongoDB and the external AI/email providers are separate services.

## Prerequisites

- Node.js 20.19+ or 22.12+ and npm
- A MongoDB database reachable by the API
- A Groq API key for AI-backed features
- A deployed client URL and API URL using HTTPS in production
- SMTP/Gmail credentials if password reset emails are required

## Deploy to Render (beginner path)

The repository includes a Render Blueprint in `render.yaml`. It creates a free Node API and a static frontend. MongoDB Atlas and the Groq API key are separate services; Render cannot create those credentials for you. Free Render web services may sleep when idle, and their local disk is not persistent, so this is suitable for a first deployment/demo rather than guaranteed resume-file storage.

1. Push this repository, including `render.yaml`, to a GitHub repository you control. Do not commit `server/.env`, `client/.env`, or API keys.
2. Create a MongoDB Atlas account and a free database cluster. Create a database user, add network access for the Render API (Atlas allows `0.0.0.0/0` for simple cloud-host access; use a strong database password), and copy the MongoDB connection string. Replace its username/password placeholders and include the database name `edupath-ai`.
3. Create a Groq API key from your Groq account. Keep it private.
4. In Render, choose **New → Blueprint**, connect your GitHub repository, and select the branch containing `render.yaml`.
5. Enter the requested variables in Render's secure form:
   - `MONGODB_URI`: the Atlas connection string
   - `GROQ_API_KEY`: your Groq key
   - `CLIENT_URL` and `FRONTEND_URL`: temporary `https://example.com` values if the client URL is not known yet
   - `VITE_API_URL`: temporary `https://example.com/api/v1` if the API URL is not known yet
   - Render generates `JWT_SECRET`; do not replace it with a publicly shared value.
6. Wait for the API and static-site services to finish their first deploy. In each Render service's **Settings**, copy its actual `onrender.com` URL; do not assume the names in `render.yaml` produced unsuffixed domains.
7. In the API service's **Environment**, set `CLIENT_URL` and `FRONTEND_URL` to the exact frontend origin (for example `https://your-frontend.onrender.com`, without a trailing slash). Save and let Render redeploy the API.
8. In the static site's **Environment**, set `VITE_API_URL` to the exact API URL followed by `/api/v1` (for example `https://your-api.onrender.com/api/v1`). Save and let Render rebuild the client.
9. Open the frontend URL, register a test account, and verify login, career loading, one AI feature, and the health endpoint at `<API URL>/api/v1/health`.
10. Only after these checks, share the frontend URL. Add `EMAIL_USER` and `EMAIL_PASSWORD` in the API environment if you want password-reset email; use a Gmail app password, not your Gmail login password.

Render's Blueprint initial setup may request the URLs before the services have their final assigned domains. The temporary values above let initial creation proceed; replace them with the actual service URLs in steps 7-8 and wait for both redeploys. Never send database passwords, API keys, or email passwords in chat.

## Local development

From the repository root in PowerShell:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

Set the values in `server\.env`; configure `MONGODB_URI`, a unique `JWT_SECRET`, `GROQ_API_KEY`, and the local `CLIENT_URL`. Set `FRONTEND_URL` to the client origin for password-reset links. Email delivery uses Gmail in the current implementation; use a Gmail app password rather than an account password.

Start the API in the first terminal:

```powershell
Set-Location server
npm ci
npm run dev
```

Start the client in a second terminal:

```powershell
Set-Location client
npm ci
npm run dev
```

The client uses `VITE_API_URL` as its API base and expects it to include `/api/v1`. The API provides `GET /api/v1/health` and Swagger UI at `/api-docs`.

## Production environment variables

Configure these on the API host; do not commit `.env` files or put server secrets in the client environment.

| Variable | Required | Purpose |
|---|---:|---|
| `PORT` | Host-dependent | Port supplied by the hosting platform; defaults to `5000`. |
| `NODE_ENV` | Recommended | Set to `production` in production. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Long, randomly generated secret used to sign access and onboarding tokens. |
| `CLIENT_URL` | Yes in production | Allowed browser origin(s) for CORS. Multiple origins may be comma-separated. |
| `GROQ_API_KEY` | For AI features | Active AI provider credential. The current `AIProvider` selects Groq. |
| `FRONTEND_URL` | For password resets | Client origin used to construct password-reset links. |
| `EMAIL_USER` | For email | Gmail account used by the mailer. |
| `EMAIL_PASSWORD` | For email | Gmail app password used by the mailer. |

`client/.env` is read at build time. Set `VITE_API_URL` to the public API origin plus `/api/v1` before running the production build. Changing that value after the bundle is built does not reconfigure the already-built client.

Example production configuration (replace every placeholder in the host's secret/configuration UI):

```text
NODE_ENV=production
PORT=<provided-by-host>
MONGODB_URI=<managed-mongodb-connection-string>
JWT_SECRET=<unique-random-secret>
CLIENT_URL=https://your-client-domain.example
FRONTEND_URL=https://your-client-domain.example
GROQ_API_KEY=<groq-api-key>
EMAIL_USER=<gmail-account>
EMAIL_PASSWORD=<gmail-app-password>
```

Generate a secret locally rather than reusing the example value:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

## Build and host the client

1. Set `client/.env` to the public API URL:

   ```text
   VITE_API_URL=https://your-api-domain.example/api/v1
   ```

2. Build the client:

   ```powershell
   Set-Location client
   npm ci
   npm run build
   ```

3. Publish `client/dist` on a static hosting service.
4. Configure the host to serve `index.html` for unknown paths (SPA history fallback); direct browser loads of paths such as `/dashboard` otherwise return a host-level 404.
5. Rebuild whenever the API URL changes.

## Build and host the API

1. Deploy the `server` directory with Node.js 20.19+ or 22.12+.
2. Install locked dependencies with `npm ci`.
3. Configure the production environment variables above.
4. Start with `npm start` (equivalent to `node server.js`). The process must run with `server` as its working directory because Swagger currently reads route files relative to the process working directory.
5. Expose the service over HTTPS and configure the client host origin in `CLIENT_URL`.
6. Confirm `GET https://your-api-domain.example/api/v1/health` succeeds after deployment.

## Database and initial data

MongoDB stores users, careers, assessments, learning activity, and related application records. Keep the database persistent and back it up. Career discovery reads active career and category documents from MongoDB. The repository has category data under `server/seed`, but the package scripts do not currently define a seed or migration command; ensure the required career/category records are loaded before expecting populated career discovery results.

## Uploaded resumes

The API stores uploaded resumes under `server/uploads` and serves them under `/uploads`. This is local filesystem storage, not object storage. On hosts with ephemeral filesystems, configure a persistent volume for that directory or uploads will be lost when the service restarts or redeploys. Restrict access to uploaded files and review the host's storage and backup policy before production use.

## Operational checks and limitations

- The client package has a production build command; the server's `test` script is still a placeholder and exits with an error.
- The Render Blueprint uses free service plans. Review Render and MongoDB Atlas plan limits and pricing before using the app beyond a demo.
- A successful frontend build does not verify connectivity to MongoDB, Groq, or Gmail. Test registration, login, career loading, AI features, resume upload, and password reset against the deployed services.
- Only Groq is selected by the active AI provider. The Gemini and OpenAI-related modules are not automatic fallbacks.
