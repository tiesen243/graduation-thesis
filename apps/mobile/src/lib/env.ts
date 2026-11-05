import { effectEnv } from '@rozumari/lib/effect-env'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export const env = effectEnv({
  shared: {},

  server: {},

  clientPrefix: 'EXPO_PUBLIC_',
  client: {
    EXPO_PUBLIC_APP_NAME: Schema.String.pipe(
      Schema.withDecodingDefault(Effect.succeed('Rozumari'))
    ),

    EXPO_PUBLIC_API_URL: Schema.String,

    EXPO_PUBLIC_WEB_URL: Schema.String,

    EXPO_PUBLIC_TURNSTILE_KEY: Schema.String,
  },

  runtimeEnv: {
    ...process.env,

    EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_WEB_URL: process.env.EXPO_PUBLIC_WEB_URL,
    EXPO_PUBLIC_TURNSTILE_KEY: process.env.EXPO_PUBLIC_TURNSTILE_KEY,
  },

  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    !!process.env.CI ||
    process.env.npm_lifecycle_event === 'lint',
})
