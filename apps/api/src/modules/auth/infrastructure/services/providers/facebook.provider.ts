import type { Crypto } from 'effect/Crypto'

import { AccountProviderId } from '@rozumari/contract/auth/schemas/account.schema'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientResponse from 'effect/unstable/http/HttpClientResponse'

import { BaseProvider } from '@/modules/auth/infrastructure/services/providers/base.provider'

const FacebookUserSchema = Schema.Struct({
  id: AccountProviderId,
  name: Schema.String,
  email: Schema.String,
  picture: Schema.Struct({ data: Schema.Struct({ url: Schema.String }) }),
})

export class FacebookProvider extends BaseProvider {
  public constructor(clientId: string, clientSecret: string, redirectUri = '') {
    super('facebook', clientId, clientSecret, redirectUri)
  }

  private authorizationEndpoint = 'https://www.facebook.com/v23.0/dialog/oauth'
  private tokenEndpoint = 'https://graph.facebook.com/v23.0/oauth/access_token'
  private apiEndpoint = 'https://graph.facebook.com/me'

  public override createAuthorizationUrl = (
    state: string,
    _codeVerifier: string
  ): Effect.Effect<URL, never, Crypto> =>
    this.createAuthorizationUrlWithoutPKCE(this.authorizationEndpoint, state, [
      'email',
      'public_profile',
    ])

  public override fetchUserData = Effect.fn(
    { self: this },
    function* fetchUserData(code: string, _codeVerifier: string) {
      const httpClient = yield* HttpClient.HttpClient

      const token = yield* this.validateAuthorizationCode(
        this.tokenEndpoint,
        code
      )

      const urlParams = new URLSearchParams()
      urlParams.set('access_token', token.access_token)
      urlParams.set('fields', ['id', 'name', 'picture', 'email'].join(','))

      const response = yield* httpClient
        .get(this.apiEndpoint, { urlParams })
        .pipe(
          Effect.flatMap(HttpClientResponse.filterStatusOk),
          Effect.flatMap(HttpClientResponse.schemaBodyJson(FacebookUserSchema)),
          Effect.orDie
        )

      return {
        id: response.id,
        name: response.name,
        email: response.email,
        image: response.picture.data.url,
      }
    }
  )
}
