import * as Schema from 'effect/Schema'

const AccessToken = Schema.String.pipe(
  Schema.brand('auth/application/AccessToken')
)
export type AccessToken = typeof AccessToken.Type

const RefreshToken = Schema.String.pipe(
  Schema.brand('auth/application/RefreshToken')
)
export type RefreshToken = typeof RefreshToken.Type

export const Tokens = Schema.Struct({
  accessToken: AccessToken,
  refreshToken: RefreshToken,
  expiresAt: Schema.Date,
})
