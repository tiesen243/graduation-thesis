import type { Cookie } from 'effect/unstable/http/Cookies'

import { COOKIE_ACCESS_TOKEN_KEY } from '@rozumari/contract/auth/middleware'

import { env } from '@/shared/env'

export const COOKIE_KEYS = {
  ACCESS_TOKEN: COOKIE_ACCESS_TOKEN_KEY,
  REFRESH_TOKEN: 'auth.refresh_token',

  OAUTH_CODE: 'auth.oauth_code',
  OAUTH_STATE: 'auth.oauth_state',
  OAUTH_REDIRECT: 'auth.oauth_redirect',
} as const

export const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: env.NODE_ENV === 'production',
  partitioned: env.NODE_ENV === 'production',
} satisfies Cookie['options']

export const TOKEN_EXPIRATION = {
  accessToken: 15 * 60, // 15 minutes
  refreshToken: 7 * 24 * 60 * 60, // 7 days
  threshold: 24 * 60 * 60, // 1 day
}
