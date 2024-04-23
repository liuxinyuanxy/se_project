import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: "src/server/schema.ts",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL ?? "postgres://postgres:password@localhost:5432/postgres"
    },
    strict: true,
})