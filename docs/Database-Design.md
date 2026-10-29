# Database design

## Persistence

The API uses MongoDB through Mongoose. `MONGODB_URI` supplies the connection string. The API connects during startup and exits when the database connection fails.

## Model inventory

The model files under `server/models` define the principal persisted concepts:

| Model | Responsibility |
|---|---|
| `User` | Account, authentication, and user profile data |
| `Career`, `CareerCategory` | Career catalog and career groupings |
| `Assessment` | Skill assessment records |
| `Roadmap` | User learning roadmap |
| `LearningProgress`, `LearningSession`, `StudySession` | Learning progress and study activity |
| `Resources` | Learning resources |
| `ResumeAnalysis` | Resume profile and analysis results |
| `Placement` | Placement-preparation data |
| `Notification` | User notifications |
| `Settings` | User settings |

Mongoose model definitions are the source of truth for fields, indexes, validation, and references. Review those definitions before changing or migrating the stored schema.

## Operational requirements

- Use a persistent managed MongoDB deployment and configure backups.
- Keep connection strings and credentials in the API host's secret store.
- Ensure active career and category records exist before testing career discovery. The repository has a category data file in `server/seed`, but no seed command is wired into `server/package.json`.
- Resume file bytes are stored on disk under `server/uploads`, not in MongoDB. They need a persistent volume or a separately implemented object-storage solution.
