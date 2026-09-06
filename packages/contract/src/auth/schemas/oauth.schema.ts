import * as Schema from 'effect/Schema'

import { AccountProvider } from '@/auth/schemas/account.schema'
import { RefreshToken } from '@/auth/schemas/token.schema'

export namespace OAuthSchema {
  export const Params = Schema.Struct({
    provider: AccountProvider,
  })
  export type Params = typeof Params.Type

  export const Query = Schema.Struct({
    code: Schema.optional(Schema.String),
    state: Schema.optional(Schema.String),
    redirect_uri: Schema.optional(Schema.String),
  })
  export type Query = typeof Query.Type

  export const Payload = Schema.Struct({
    token: RefreshToken,
  })
  export type Payload = typeof Payload.Type

  export const Success = Schema.Struct({
    success: Schema.Boolean,
  })
}
