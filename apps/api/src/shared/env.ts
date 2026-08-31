// oxlint-disable unicorn/max-nested-calls

import { effectEnv } from '@rozumari/lib/effect-env'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import * as SchemaGetter from 'effect/SchemaGetter'

export const env = effectEnv({
  shared: {
    NODE_ENV: Schema.Literals(['development', 'production', 'test']).pipe(
      Schema.withDecodingDefault(Effect.succeed('development'))
    ),

    PORT: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(3000))),

    // Vercel environment variables
    VERCEL_ENV: Schema.optional(
      Schema.Literals(['development', 'preview', 'production'])
    ),
    VERCEL_URL: Schema.optional(Schema.String),
    VERCEL_BRANCH_URL: Schema.optional(Schema.String),
    VERCEL_PROJECT_PRODUCTION_URL: Schema.optional(Schema.String),
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
      })
    ),

    DATABASE_URL: Schema.String.pipe(
      Schema.withDecodingDefault(
        Effect.succeed('postgresql://postgres:secret@127.0.0.1:5432/db')
      )
    ),

    AUTH_SECRET: Schema.String,
    AUTH_FACEBOOK_ID: Schema.String,
    AUTH_FACEBOOK_SECRET: Schema.String,
    AUTH_GOOGLE_ID: Schema.String,
    AUTH_GOOGLE_SECRET: Schema.String,

    RESEND_API_KEY: Schema.String,

    TIMEZONE: Schema.TimeZoneFromString.pipe(
      Schema.withDecodingDefault(Effect.succeed('Asia/Ho_Chi_Minh'))
    ),
  },

  clientPrefix: 'PUBLIC_',
  client: {},

  runtimeEnv: process.env,

  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    !!process.env.CI ||
    process.env.npm_lifecycle_event === 'lint',
})
