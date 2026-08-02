import * as Schema from 'effect/Schema'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { JwtError } from '@/modules/auth/application/security/jwt'
import { ProviderError } from '@/modules/auth/application/security/oauth'
import { Unauthorized } from '@/modules/auth/domain/entities/auth.error'

export class OAuthGroup extends HttpApiGroup.make('oauth')
  .add(
    HttpApiEndpoint.get('redirect', '/:provider', {
      params: Schema.Struct({
        provider: Schema.String,
      }),
      query: Schema.Struct({
        redirect_uri: Schema.optional(Schema.String),
      }),
      error: ProviderError,
    })
  )

  .add(
    HttpApiEndpoint.get('callback', '/:provider/callback', {
      params: Schema.Struct({
        provider: Schema.String,
      }),
      query: Schema.Struct({
        code: Schema.String,
        state: Schema.String,
      }),
      error: [ProviderError, Unauthorized, JwtError],
    })
  )

  .prefix('/api/auth') {}
