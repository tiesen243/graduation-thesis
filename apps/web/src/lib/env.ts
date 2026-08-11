import { createEnv } from '@rozumari/lib/create-env'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export const env = createEnv({
  shared: {
    NODE_ENV: Schema.Literals(['development', 'production', 'test']).pipe(
      Schema.withDecodingDefault(Effect.succeed('development')),
      Schema.toStandardSchemaV1
    ),

    PORT: Schema.Number.pipe(
      Schema.withDecodingDefault(Effect.succeed(5173)),
      Schema.toStandardSchemaV1
    ),

    // Vercel environment variables
    VERCEL_ENV: Schema.Literals(['development', 'preview', 'production']).pipe(
      Schema.optional,
      Schema.toStandardSchemaV1
    ),
    VERCEL_URL: Schema.String.pipe(Schema.optional, Schema.toStandardSchemaV1),
    VERCEL_BRANCH_URL: Schema.String.pipe(
      Schema.optional,
      Schema.toStandardSchemaV1
    ),
    VERCEL_PROJECT_PRODUCTION_URL: Schema.String.pipe(
      Schema.optional,
      Schema.toStandardSchemaV1
    ),
  },

  server: {},

  clientPrefix: 'VITE_',
  client: {
    VITE_APP_NAME: Schema.String.pipe(
      Schema.withDecodingDefault(Effect.succeed('Rozumari')),
      Schema.toStandardSchemaV1
    ),

    VITE_API_URL: Schema.String.pipe(
      Schema.withDecodingDefault(Effect.succeed('http://localhost:3000')),
      Schema.toStandardSchemaV1
    ),

    VITE_BYPASS_TOKEN: Schema.String.pipe(
      Schema.optional,
      Schema.toStandardSchemaV1
    ),
  },

  runtimeEnv: {
    ...process.env,

    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_BYPASS_TOKEN: import.meta.env.VITE_BYPASS_TOKEN,
  },

  emptyStringAsUndefined: true,

  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    !!process.env.CI ||
    process.env.npm_lifecycle_event === 'lint',
})
