import { defineConfig } from 'drizzle-kit'
import path from 'node:path'

import { env } from '@/shared/env'

export default defineConfig({
  strict: true,
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  schema: path.resolve(
    process.cwd(),
    'src/modules/*/infrastructure/persistence/drizzle/schema.ts'
  ),
  out: path.resolve(
    process.cwd(),
    'src/shared/infrastructure/persistence/drizzle/migrations'
  ),
})
