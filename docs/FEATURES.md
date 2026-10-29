# Feature and route inventory

This inventory is based on the client route configuration and Express route mounts. Routes are listed as implemented in source; external-service-dependent behavior still needs runtime verification.

## Browser application

### Public routes

| Route | Feature |
|---|---|
| `/` and `/home` | Landing page |
| `/register`, `/login` | Account registration and sign-in |
| `/forgot-password`, `/reset-password/:token` | Password recovery |
| `/onboarding` | New-user onboarding |
| `/career-explorer`, `/career-selection` | Public career exploration and selection flows |
| `/terms-and-conditions`, `/privacy-policy` | Legal information |

### Sign-in required

| Route | Feature |
|---|---|
| `/dashboard` | Personalized dashboard |
| `/profile`, `/profile/edit` | Profile viewing and editing |
| `/career-discovery`, `/skill-assessment` | Career discovery and skill assessments |
| `/roadmap`, `/learning`, `/learning-session` | Learning plan and study sessions |
| `/progress`, `/resources` | Learning progress and resources |
| `/placement`, `/resume-analyzer` | Placement preparation and resume analysis |
| `/settings`, `/chat` | Preferences and AI mentor |

Protected browser routes are guarded by the client route layer; protected API routes separately require a bearer token.

## API areas

All application APIs are mounted below `/api/v1`.

| Prefix | Main capability |
|---|---|
| `/auth` | Registration, login, logout, password reset, password change |
| `/users`, `/profile` | User profile and onboarding data |
| `/careers`, `/career-explorer`, `/career-selection` | Career catalog, recommendations, skill gaps, and chosen career |
| `/assessments` | Assessment start and submission |
| `/dashboard` | Dashboard data |
| `/learning`, `/learning-progress`, `/study-session` | Learning plans, session lifecycle, and progress analytics |
| `/roadmap`, `/resources` | Learning roadmaps and resource recommendations |
| `/chat` | Authenticated AI mentor |
| `/resume-analyzer`, `/placement` | Resume analysis and placement readiness |
| `/notifications`, `/settings` | Notifications and user settings |
| `/health` | API health response |

Interactive API reference is served at `/api-docs`. The Swagger annotations cover only part of the full API surface; the Express route files remain the complete route implementation.

## Important runtime dependencies

- MongoDB is needed for API-backed account and learning features.
- Groq is the active provider for AI-backed responses.
- Gmail configuration is required for password-reset email delivery.
- Career discovery needs career and category documents in the database.
- Resume upload files are stored on the API host filesystem under `server/uploads`.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment setup and deployment checks. Automated server tests are not configured yet, so verify critical user flows in a live staging environment.

