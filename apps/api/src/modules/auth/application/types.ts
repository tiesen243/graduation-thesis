import * as Schema from 'effect/Schema'

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
