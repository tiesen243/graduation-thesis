import { AccountProviderId } from '@rozumari/contract/auth/schemas/account.schema'
import * as Effect from 'effect/Effect'
import * as HttpClient from 'effect/http/HttpClient'
import * as HttpClientResponse from 'effect/http/HttpClientResponse'
import * as Schema from 'effect/Schema'
import * as SchemaGetter from 'effect/SchemaGetter'

import { BaseProvider } from '@/modules/auth/infrastructure/services/providers/base.provider'

const GithubUserSchema = Schema.Struct({
  id: Schema.Number.pipe(
    Schema.decodeTo(AccountProviderId, {
      decode: SchemaGetter.transform((s) => s.toString()),
      encode: SchemaGetter.transform((s) => Math.trunc(Number(s))),
    })
  ),
  login: Schema.String,
  email: Schema.String,
  avatar_url: Schema.String,
})

export class GithubProvider extends BaseProvider {
  public constructor(clientId: string, clientSecret: string, redirectUri = '') {
    super('github', clientId, clientSecret, redirectUri)
  }

  private authorizationEndpoint = 'https://github.com/login/oauth/authorize'
  private tokenEndpoint = 'https://github.com/login/oauth/access_token'
  private apiEndpoint = 'https://api.github.com/user'

  public override createAuthorizationUrl = (
    state: string,
    codeVerifier: string
  ) =>
    this.createAuthorizationUrlWithPKCE(
      this.authorizationEndpoint,
      state,
      ['read:user', 'user:email'],
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
          Effect.flatMap(HttpClientResponse.schemaBodyJson(GithubUserSchema)),
          Effect.orDie
        )

      return {
        id: response.id,
        name: response.login,
        email: response.email,
        image: response.avatar_url,
      }
    }
  )
}
