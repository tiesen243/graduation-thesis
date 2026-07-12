import { createEnv } from '@workspace/lib/create-env'
import * as z from 'zod'

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },

  server: {
    DATABASE_URL: z
      .url()
      .default('postgresql://postgres:secret@127.0.0.1:5432/db'),
  },

  clientPrefix: 'PUBLIC_',
  client: {},

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,

  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
})
