import * as Effect from 'effect/Effect'

import type { OAuthService } from '@/modules/auth/application/oauth.service'
import type { Http } from '@/shared/http'

import { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'
import { effetch } from '@/shared/lib/utils'

export class VercelProvider extends BaseProvider {
  public constructor(clientId: string, clientSecret: string, redirectUri = '') {
    super('vercel', clientId, clientSecret, redirectUri)
  }

  private authorizationEndpoint = 'https://vercel.com/oauth/authorize'
  private tokenEndpoint = 'https://api.vercel.com/login/oauth/token'
  private apiEndpoint = 'https://api.vercel.com/login/oauth/userinfo'

  public override createAuthorizationUrl = (
    state: string,
    codeVerifier: string
  ): Effect.Effect<URL> =>
    this.createAuthorizationUrlWithPKCE(
      this.authorizationEndpoint,
      state,
      ['openid', 'email', 'profile'],
      codeVerifier
    )

  public override fetchUserData = (
    code: string,
    codeVerifier: string
  ): Effect.Effect<OAuthService.Account, Http> =>
    Effect.gen(this, function* fetchUserDataGen() {
      const token = yield* this.validateAuthorizationCode(
        this.tokenEndpoint,
        code,
        codeVerifier
      )

      const user = yield* effetch<VercelUserResponse>(this.apiEndpoint, {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })

      return {
        id: user.sub,
        name: user.name,
        email: user.email,
        image: user.picture,
      }
    })
}

interface VercelUserResponse {
  sub: string
  name: string
  email: string
  picture: string
  preferred_username: string
}
