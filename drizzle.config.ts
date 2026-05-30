import { defineConfig } from 'drizzle-kit';
import { env } from './src/api/base/env';

export default defineConfig({
  schema: './src/api/database/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
