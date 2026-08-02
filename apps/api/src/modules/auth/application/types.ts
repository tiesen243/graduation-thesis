import * as Schema from 'effect/Schema'

export const AccessToken = Schema.String.pipe(
  Schema.brand('auth/application/AccessToken')
)
export type AccessToken = typeof AccessToken.Type

export const RefreshToken = Schema.String.pipe(
  Schema.brand('auth/application/RefreshToken')
)
export type RefreshToken = typeof RefreshToken.Type

export const Tokens = Schema.Struct({
  accessToken: AccessToken,
  refreshToken: RefreshToken,
  expiresAt: Schema.Date,
})
export type Tokens = typeof Tokens.Type

export namespace OAuth {
  export const Token = Schema.Struct({
    access_token: Schema.String,
    token_type: Schema.String,
    expires_in: Schema.Number,
  })
  export type Token = typeof Token.Type

  export const Account = Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    email: Schema.String,
    image: Schema.NullOr(Schema.String),
  })
  export type Account = typeof Account.Type
}
