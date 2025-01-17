import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({
  path: ".env.local",
})

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/schema.ts",
  dbCredentials: {
    url: process.env.AUTH_DRIZZLE_URL!,
  },
})
