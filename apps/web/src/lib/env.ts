import { createEnv } from '@rozumari/lib/create-env'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export const env = createEnv({
  shared: {
    NODE_ENV: Schema.Literals(['development', 'production', 'test']).pipe(
      Schema.withDecodingDefault(Effect.succeed('development')),
      Schema.toStandardSchemaV1
    ),

    VERCEL_URL: Schema.String.pipe(Schema.optional, Schema.toStandardSchemaV1),
    VERCEL_PROJECT_PRODUCTION_URL: Schema.String.pipe(
      Schema.optional,
      Schema.toStandardSchemaV1
    ),
  },

  server: {},

  clientPrefix: 'VITE_',
  client: {
    VITE_API_URL: Schema.String.pipe(
      Schema.withDecodingDefault(Effect.succeed('http://localhost:3000')),
      Schema.toStandardSchemaV1
    ),
  },

  runtimeEnv: import.meta.env,

  emptyStringAsUndefined: true,

  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    !!process.env.CI ||
    process.env.npm_lifecycle_event === 'lint',
})
