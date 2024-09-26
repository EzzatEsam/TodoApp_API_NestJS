# TodoProj API NestJS

This is a NestJS API for a Todo application supporting multiple projects and multiple Todos for each project with user management and authorization. It utilizes JWT (JSON Web Tokens) for authentication and Drizzle ORM for the postgres database deployed on [Neon](https://neon.tech).

This only provides the API endpoints for the Todo application.

A similar implementation in ASP.NET Core can be found in this repo [TodoProj API Dotnet](https://github.com/EzzatEsam/TodoApplicationBackendAspDotNet).

A wokring implementation of the frontend made with react and tailwind can be found in this repo [TodoAppFrontendReact
](https://github.com/EzzatEsam/TodoAppFrontendReact)

## Getting Started

To get started with this project, follow the steps below:

1. Clone the repository.

```bash
git clone https://github.com/EzzatEsam/TodoAppNestJS
```

2. Install the dependencies:

```bash
cd TodoAppNestJS
npm install
```

3. Provide the environment variables:
   `NEON_DB_URL` or add your own database credentials `HOST`, `PORT`, `USER`, `PASS` and `NAME` to your `.env` file but you will have to modify the config in both the [drizzle.config.ts](drizzle.config.ts) and the [db.ts](src/db/db.ts) files.

4. Update the database schema:

```bash
npm run migrate
```

5. Run the server:

```bash
npm run start
```
