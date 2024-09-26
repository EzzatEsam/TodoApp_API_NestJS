import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',

  dbCredentials: {
    url: process.env.NEON_DB_URL!,
    // host: process.env.DB_HOST!,
    // port: Number(process.env.DB_PORT!),
    // user: process.env.DB_USER!,
    // password: process.env.DB_PASS!,
    // database: process.env.DB_NAME!,
    ssl: false,
  },
});
