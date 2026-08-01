// oxlint-disable unicorn/max-nested-calls

import { createEnv } from '@rozumari/lib/create-env'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import * as SchemaGetter from 'effect/SchemaGetter'

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

  server: {
    CORS_ORIGIN: Schema.String.pipe(
      Schema.withDecodingDefault(Effect.succeed('http://localhost:5173')),
      Schema.decodeTo(Schema.Array(Schema.String), {
        decode: SchemaGetter.transform((str) =>
          str
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        ),
        encode: SchemaGetter.transform((arr) => arr.join(',')),
      }),
      Schema.toStandardSchemaV1
    ),

    DATABASE_URL: Schema.String.pipe(
      Schema.withDecodingDefault(
        Effect.succeed('postgresql://postgres:secret@127.0.0.1:5432/db')
      ),
      Schema.toStandardSchemaV1
    ),

    AUTH_SECRET: Schema.String.pipe(Schema.toStandardSchemaV1),
    AUTH_GOOGLE_ID: Schema.String.pipe(Schema.toStandardSchemaV1),
    AUTH_GOOGLE_SECRET: Schema.String.pipe(Schema.toStandardSchemaV1),
  },

  clientPrefix: 'PUBLIC_',
  client: {},

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,

  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    !!process.env.CI ||
    process.env.npm_lifecycle_event === 'lint',
})
