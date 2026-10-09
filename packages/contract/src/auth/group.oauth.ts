import * as HttpApiEndpoint from 'effect/http-api/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/http-api/HttpApiGroup'
import * as OpenApi from 'effect/http-api/OpenApi'

import { ProviderError, Unauthorized } from '@/auth/schemas/auth.error'
import { OAuthSchema } from '@/auth/schemas/oauth.schema'
import { UserAlreadyDeleted, UserNotFound } from '@/user/schemas/user.error'

export class OAuthGroup extends HttpApiGroup.make('oauth')

  .add(
    HttpApiEndpoint.get('authorize', '/:provider', {
      params: OAuthSchema.Params,
      query: OAuthSchema.Query,
      error: [ProviderError],
    })
  )

  .add(
    HttpApiEndpoint.get('callback', '/:provider/callback', {
      params: OAuthSchema.Params,
      query: OAuthSchema.Query,
      error: [ProviderError, UserNotFound, UserAlreadyDeleted],
    })
  )

  .add(
    HttpApiEndpoint.post('exchange', '/oauth/exchange', {
      payload: OAuthSchema.Payload,
      success: OAuthSchema.Success,
      error: [ProviderError, Unauthorized],
    })
  )

  .prefix('/api/auth')
  .annotateMerge(OpenApi.annotations({ exclude: true })) {}
