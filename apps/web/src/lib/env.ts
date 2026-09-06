import { effectEnv } from '@rozumari/lib/effect-env'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export const env = effectEnv({
  shared: {
    NODE_ENV: Schema.Literals(['development', 'production', 'test']).pipe(
      Schema.withDecodingDefault(Effect.succeed('development'))
    ),

    PORT: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(5173))),

    // Vercel environment variables
    VERCEL_ENV: Schema.optional(
      Schema.Literals(['development', 'preview', 'production'])
    ),
    VERCEL_URL: Schema.optional(Schema.String),
    VERCEL_BRANCH_URL: Schema.optional(Schema.String),
    VERCEL_PROJECT_PRODUCTION_URL: Schema.optional(Schema.String),
  },

  server: {},

  clientPrefix: 'VITE_',
  client: {
    VITE_APP_NAME: Schema.String.pipe(
      Schema.withDecodingDefault(Effect.succeed('Rozumari'))
    ),

    VITE_API_URL: Schema.String.pipe(
      Schema.withDecodingDefault(Effect.succeed('http://localhost:3000'))
    ),

    VITE_BYPASS_TOKEN: Schema.optional(Schema.String),
  },

  runtimeEnv: {
    ...process.env,

    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_BYPASS_TOKEN: import.meta.env.VITE_BYPASS_TOKEN,
  },

  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    !!process.env.CI ||
    process.env.npm_lifecycle_event === 'lint',
})
