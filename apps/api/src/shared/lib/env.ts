import { createEnv } from '@workspace/lib/create-env'
import * as z from 'zod'

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },

  server: {
    CORS_ORIGIN: z
      .string()
      .default('http://localhost:5173,http://localhost:4173'),

    DATABASE_URL: z
      .url()
      .default('postgresql://postgres:secret@127.0.0.1:5432/db'),

    AUTH_SECRET: z.string().default('secret'),
  },

  clientPrefix: 'PUBLIC_',
  client: {},

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,

  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
})
