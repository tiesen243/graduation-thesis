import { createEnv } from '@rozumari/lib/create-env'
import * as z from 'zod'

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

    VERCEL_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },

  server: {
    CORS_ORIGIN: z
      .string()
      .default('http://localhost:5173,http://localhost:4173'),

    DATABASE_URL: z
      .url()
      .default('postgresql://postgres:secret@127.0.0.1:5432/db'),

    AUTH_SECRET: z.string().default('secret'),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
  },

  clientPrefix: 'VITE_',
  client: {
    VITE_API_URL: z.string().optional(),
  },

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,

  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
})
