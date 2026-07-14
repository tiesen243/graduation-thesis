import * as Effect from 'effect/Effect'

import type { OAuthService } from '@/modules/auth/application/oauth.service'
import type { Http } from '@/shared/http'

import { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'
import { effetch } from '@/shared/lib/utils'

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

      const user = yield* effetch<GoogleUserResponse>(this.apiEndpoint, {
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

interface GoogleUserResponse {
  sub: string
  name: string
  email: string
  picture: string
}
