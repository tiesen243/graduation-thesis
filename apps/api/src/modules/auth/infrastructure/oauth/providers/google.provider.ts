import type { Crypto } from 'effect/Crypto'

import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientResponse from 'effect/unstable/http/HttpClientResponse'

import { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'

const GoogleUserSchema = Schema.Struct({
  sub: Schema.String,
  name: Schema.String,
  email: Schema.String,
  picture: Schema.String,
})

export class GoogleProvider extends BaseProvider {
  public constructor(clientId: string, clientSecret: string, redirectUri = '') {
    super('google', clientId, clientSecret, redirectUri)
  }

  private authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth'
  private tokenEndpoint = 'https://oauth2.googleapis.com/token'
  private apiEndpoint = 'https://openidconnect.googleapis.com/v1/userinfo'

  public override createAuthorizationUrl = (
    state: string,
    codeVerifier: string
  ): Effect.Effect<URL, never, Crypto> =>
    this.createAuthorizationUrlWithPKCE(
      this.authorizationEndpoint,
      state,
      ['openid', 'email', 'profile'],
      codeVerifier
    )

  public override fetchUserData = Effect.fn(
    { self: this },
    function* fetchUserData(code: string, codeVerifier: string) {
      const httpClient = yield* HttpClient.HttpClient

      const token = yield* this.validateAuthorizationCode(
        this.tokenEndpoint,
        code,
        codeVerifier
      )

      const response = yield* httpClient
        .get(this.apiEndpoint, {
          headers: { Authorization: `Bearer ${token.access_token}` },
        })
        .pipe(
          Effect.flatMap(HttpClientResponse.filterStatusOk),
          Effect.flatMap(HttpClientResponse.schemaBodyJson(GoogleUserSchema))
        )

      return {
        id: response.sub,
        name: response.name,
        email: response.email,
        image: response.picture,
      }
    }
  )
}
