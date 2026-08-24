import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'
import * as OpenApi from 'effect/unstable/httpapi/OpenApi'

import { ProviderError, InvalidToken } from '@/auth/schemas/auth.error'
import { OAuthSchema } from '@/auth/schemas/oauth.schema'

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
      error: [ProviderError],
    })
  )

  .add(
    HttpApiEndpoint.post('exchange', '/oauth/exchange', {
      payload: OAuthSchema.Payload,
      success: OAuthSchema.Success,
      error: [ProviderError, InvalidToken],
    })
  )

  .prefix('/api/auth')
  .annotateMerge(OpenApi.annotations({ exclude: true })) {}
