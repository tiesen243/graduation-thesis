import type { Cookie } from 'effect/unstable/http/Cookies'

export const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  maxAge: '5 minutes',
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
