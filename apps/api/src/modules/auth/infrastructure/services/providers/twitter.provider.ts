import { AccountProviderId } from '@rozumari/contract/auth/schemas/account.schema'
import * as Effect from 'effect/Effect'
import * as HttpClient from 'effect/http/HttpClient'
import * as HttpClientResponse from 'effect/http/HttpClientResponse'
import * as Schema from 'effect/Schema'

import { BaseProvider } from '@/modules/auth/infrastructure/services/providers/base.provider'

const XUserResponseSchema = Schema.Struct({
  data: Schema.Struct({
    id: AccountProviderId,
    username: Schema.String,
    confirmed_email: Schema.String,
    profile_image_url: Schema.String,
  }),
})

export class TwitterProvider extends BaseProvider {
  public constructor(clientId: string, clientSecret: string, redirectUri = '') {
    super('twitter', clientId, clientSecret, redirectUri)
  }

  private authorizationEndpoint = 'https://x.com/i/oauth2/authorize'
  private tokenEndpoint = 'https://api.x.com/2/oauth2/token'
  private apiEndpoint = 'https://api.x.com/2/users/me'

  public override createAuthorizationUrl = (
    state: string,
    codeVerifier: string
  ) =>
    this.createAuthorizationUrlWithPKCE(
      this.authorizationEndpoint,
      state,
      ['tweet.read', 'users.read', 'offline.access', 'users.email'],
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
          urlParams: new URLSearchParams({
            'user.fields': 'id,username,confirmed_email,profile_image_url',
          }),
          headers: { Authorization: `Bearer ${token.access_token}` },
        })
        .pipe(
          Effect.flatMap(HttpClientResponse.filterStatusOk),
          Effect.flatMap(
            HttpClientResponse.schemaBodyJson(XUserResponseSchema)
          ),
          Effect.orDie
        )

      return {
        id: response.data.id,
        name: response.data.username,
        email: response.data.confirmed_email,
        image: response.data.profile_image_url
          ? response.data.profile_image_url.replace('_normal', '')
          : null,
      }
    }
  )
}
