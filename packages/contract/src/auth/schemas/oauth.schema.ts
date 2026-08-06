import * as Schema from 'effect/Schema'

export namespace OAuthSchema {
  export const Params = Schema.Struct({
    provider: Schema.String,
  })
  export type Params = typeof Params.Type

  export const Query = Schema.Struct({
    code: Schema.optional(Schema.String),
    state: Schema.optional(Schema.String),
    redirect_uri: Schema.optional(Schema.String),
  })
  export type Query = typeof Query.Type
}
