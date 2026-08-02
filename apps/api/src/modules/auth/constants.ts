import type { Cookie } from 'effect/unstable/http/Cookies'

export const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  partitioned: process.env.NODE_ENV === 'production',
} satisfies Cookie['options']

export const COOKIE_KEYS = {
  code: 'auth:oauth_code',
  state: 'auth:oauth_state',
  redirect: 'auth:oauth_redirect',

  accessToken: 'auth:access_token',
  refreshToken: 'auth:refresh_token',
} as const

export const TOKEN_EXPIRATION = {
  accessToken: 15 * 60, // 15 minutes
  refreshToken: 7 * 24 * 60 * 60, // 7 days
  threshold: 24 * 60 * 60, // 1 day
}
