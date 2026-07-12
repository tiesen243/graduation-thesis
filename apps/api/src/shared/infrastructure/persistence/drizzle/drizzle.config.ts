import { defineConfig } from 'drizzle-kit'
import path from 'node:path'

import { env } from '@/shared/lib/env'

const cwd = path.join(process.cwd(), 'src')

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: { url: env.DATABASE_URL },
  schema: path.join(
    cwd,
    'modules/*/infrastructure/persistence/drizzle/drizzle.schema.ts'
  ),
  out: path.join(cwd, 'shared/infrastructure/persistence/drizzle/migrations'),
  strict: true,
})
