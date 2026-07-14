import * as Effect from 'effect/Effect'

import type { OAuthService } from '@/modules/auth/application/oauth.service'
import type { Http } from '@/shared/http'

import { generateCodeChallenge } from '@/modules/auth/lib/crypto'
import { env } from '@/shared/lib/env'
import { effetch } from '@/shared/lib/utils'

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
  ): Effect.Effect<URL>

  public abstract fetchUserData(
    code: string,
    codeVerifier: string
  ): Effect.Effect<OAuthService.Account, Http>

  protected createCallbackUrl() {
    let baseUrl = `http://localhost:${process.env.PORT ?? 3000}`
    if (env.VERCEL_PROJECT_PRODUCTION_URL)
      baseUrl = `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    else if (env.VERCEL_URL) baseUrl = `https://${env.VERCEL_URL}`

    return `${baseUrl}/api/auth/${this.providerName}/callback`
  }

  protected createAuthorizationUrlWithoutPKCE = (
    endpoint: string,
    state: string,
    scopes: string[]
  ): Effect.Effect<URL> =>
    Effect.gen(this, function* createAuthorizationUrlWithoutPKCEGen() {
      const url = new URL(endpoint)
      url.searchParams.set('response_type', 'code')
      url.searchParams.set('client_id', this.clientId)
      url.searchParams.set('state', state)

      if (scopes.length > 0) url.searchParams.set('scope', scopes.join(' '))
      url.searchParams.set('redirect_uri', this.redirectUri)

      return yield* Effect.succeed(url)
    })

  protected createAuthorizationUrlWithPKCE = (
    endpoint: string,
    state: string,
    scopes: string[],
    codeVerifier: string,
    codeChallengeMethod: 'S256' | 'plain' = 'S256'
  ): Effect.Effect<URL> =>
    Effect.gen(this, function* createAuthorizationUrlWithPKCEGen() {
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
    })

  protected validateAuthorizationCode = (
    endpoint: string,
    code: string,
    codeVerifier: string | null = null
  ): Effect.Effect<OAuthService.Token, Http> =>
    Effect.gen(this, function* validateAuthorizationCodeGen() {
      const body = new URLSearchParams()
      body.set('grant_type', 'authorization_code')
      body.set('redirect_uri', this.redirectUri)
      body.set('client_id', this.clientId)
      body.set('code', code)

      if (codeVerifier) body.set('code_verifier', codeVerifier)

      const request = this.createRequest(endpoint, body)
      request.headers.set(
        'Authorization',
        `Basic ${this.encodeCredentials(this.clientId, this.clientSecret)}`
      )

      return yield* effetch<OAuthService.Token>(request)
    })

  // oxlint-disable-next-line class-methods-use-this
  private createRequest(enpoint: string, body: URLSearchParams) {
    const bodyBytes = new TextEncoder().encode(body.toString())
    const request = new Request(enpoint, { method: 'POST', body: bodyBytes })

    request.headers.set('Content-Type', 'application/x-www-form-urlencoded')
    request.headers.set('Accept', 'application/json')
    request.headers.set('User-Agent', 'yuki-auth')
    request.headers.set('Content-Length', bodyBytes.byteLength.toString())

    return request
  }

  // oxlint-disable-next-line class-methods-use-this
  private encodeCredentials(clientId: string, clientSecret: string): string {
    const credentials = `${clientId}:${clientSecret}`
    const bytes = new TextEncoder().encode(credentials)
    return btoa(String.fromCodePoint(...bytes))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll(/[=]/gu, '')
  }
}
