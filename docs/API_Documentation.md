# API documentation

## Base URL

All REST API routes are mounted under `/api/v1`.

- Local API: `http://localhost:5000/api/v1`
- Health check: `GET /api/v1/health`
- Swagger UI: `http://localhost:5000/api-docs`

Set the frontend `VITE_API_URL` to the API base URL including `/api/v1`.

## Authentication

Most user-specific routes require a JWT bearer token:

```http
Authorization: Bearer <access-token>
```

Public authentication endpoints include:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a user |
| `POST` | `/api/v1/auth/login` | Sign in |
| `POST` | `/api/v1/auth/logout` | Log out |
| `POST` | `/api/v1/auth/forgot-password` | Request a reset email |
| `POST` | `/api/v1/auth/reset-password` | Set a password with a reset token |

## Route groups

| Path | Description |
|---|---|
| `/api/v1/users` | Current user, profile updates, career selection, password change |
| `/api/v1/profile` | Onboarding profile updates |
| `/api/v1/assessments` | Start and submit skill assessments |
| `/api/v1/careers` | Career catalog, search, categories, statistics, and career records |
| `/api/v1/career-explorer` | Authenticated recommendations, career details, and skill-gap data |
| `/api/v1/career-selection` | Read or change the user's selected career |
| `/api/v1/dashboard` | Dashboard data |
| `/api/v1/learning` | Learning progress, session lifecycle, and study history |
| `/api/v1/learning-progress` | Progress summaries and analytics |
| `/api/v1/study-session` | Save study-session data |
| `/api/v1/roadmap` | User roadmap |
| `/api/v1/resources` | Learning resources |
| `/api/v1/chat` | AI mentor chat |
| `/api/v1/resume-analyzer` | Resume profile, upload, and analysis |
| `/api/v1/placement` | Placement preparation profile |
| `/api/v1/notifications` | List, read, and delete notifications |
| `/api/v1/settings` | Read and update user settings |

Use the running Swagger UI for annotated request and response schemas. The route-group list above is an index, not a substitute for each route's validation and response contract.
