import type { Crypto } from 'effect/Crypto'
import type { SchemaError } from 'effect/SchemaError'
import type { HttpClientError } from 'effect/unstable/http/HttpClientError'

import * as Effect from 'effect/Effect'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'
import * as HttpClientResponse from 'effect/unstable/http/HttpClientResponse'

import { OAuth } from '@/modules/auth/application/types'
import { generateCodeChallenge } from '@/modules/auth/infrastructure/security/crypto'
import { env } from '@/shared/env'

export abstract class BaseProvider {
  protected constructor(
    public readonly providerName: string,
    protected readonly clientId: string,
    protected readonly clientSecret: string,
    protected readonly redirectUri: string
  ) {
    if (!this.redirectUri) this.redirectUri = this.createCallbackUrl()
  }

  public abstract createAuthorizationUrl(
    state: string,
    codeVerifier: string
  ): Effect.Effect<URL, never, Crypto>

  public abstract fetchUserData(
    code: string,
    codeVerifier: string
  ): Effect.Effect<
    OAuth.Account,
    HttpClientError | SchemaError,
    HttpClient.HttpClient
  >

  protected createCallbackUrl() {
    let baseUrl = `http://localhost:${env.PORT}`
    if (env.VERCEL_PROJECT_PRODUCTION_URL)
      baseUrl = `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    else if (env.VERCEL_URL) baseUrl = `https://${env.VERCEL_URL}`

    return `${baseUrl}/api/auth/${this.providerName}/callback`
  }

  protected createAuthorizationUrlWithoutPKCE = Effect.fn(
    { self: this },
    function* createAuthorizationUrlWithoutPKCE(
      endpoint: string,
      state: string,
      scopes: string[]
    ) {
      const url = new URL(endpoint)
      url.searchParams.set('response_type', 'code')
      url.searchParams.set('client_id', this.clientId)
      url.searchParams.set('state', state)

      if (scopes.length > 0) url.searchParams.set('scope', scopes.join(' '))
      url.searchParams.set('redirect_uri', this.redirectUri)

      return yield* Effect.succeed(url)
    }
  )

  protected createAuthorizationUrlWithPKCE = Effect.fn(
    { self: this },
    function* createAuthorizationUrlWithPKCE(
      endpoint: string,
      state: string,
      scopes: string[],
      codeVerifier: string,
      codeChallengeMethod: 'S256' | 'plain' = 'S256'
    ) {
      const url = yield* this.createAuthorizationUrlWithoutPKCE(
        endpoint,
        state,
        scopes
      )

      if (codeChallengeMethod === 'S256') {
        const codeChallenge = yield* generateCodeChallenge(codeVerifier)
        url.searchParams.set('code_challenge', codeChallenge)
        url.searchParams.set('code_challenge_method', 'S256')
      } else {
        url.searchParams.set('code_challenge', codeVerifier)
        url.searchParams.set('code_challenge_method', 'plain')
      }

      return url
    }
  )

  protected validateAuthorizationCode = Effect.fn(
    { self: this },
    function* validateAuthorizationCode(
      endpoint: string,
      code: string,
      codeVerifier: string | null = null
    ) {
      const httpClient = yield* HttpClient.HttpClient

      const body = new URLSearchParams()
      body.set('grant_type', 'authorization_code')
      body.set('redirect_uri', this.redirectUri)
      body.set('client_id', this.clientId)
      body.set('code', code)

      if (codeVerifier) body.set('code_verifier', codeVerifier)

      const request = HttpClientRequest.post(endpoint).pipe(
        HttpClientRequest.bodyUrlParams(body),
        HttpClientRequest.setHeader(
          'Authorization',
          `Basic ${this.credentials}`
        ),
        HttpClientRequest.acceptJson
      )

      const response = yield* httpClient
        .execute(request)
        .pipe(
          Effect.flatMap(HttpClientResponse.filterStatusOk),
          Effect.flatMap(HttpClientResponse.schemaBodyJson(OAuth.Token)),
          Effect.scoped
        )

      return response
    }
  )

  private get credentials(): string {
    const credentials = `${this.clientId}:${this.clientSecret}`
    const bytes = new TextEncoder().encode(credentials)
    return btoa(String.fromCodePoint(...bytes))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll(/[=]/gu, '')
  }
}
