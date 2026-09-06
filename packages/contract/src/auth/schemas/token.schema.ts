import * as Schema from 'effect/Schema'

export const AccessToken = Schema.String.pipe(
  Schema.brand('auth/domain/AccessToken')
)
export type AccessToken = typeof AccessToken.Type

export const RefreshToken = Schema.String.pipe(
  Schema.brand('auth/domain/RefreshToken')
)
export type RefreshToken = typeof RefreshToken.Type

export const Token = Schema.Struct({
  accessToken: AccessToken,
  refreshToken: RefreshToken,
  expiresAt: Schema.Date,
})
export type Token = typeof Token.Type
