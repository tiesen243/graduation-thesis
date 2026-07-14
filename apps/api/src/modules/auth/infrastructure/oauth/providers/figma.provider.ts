import * as Effect from 'effect/Effect'

import type { OAuthService } from '@/modules/auth/application/oauth.service'
import type { Http } from '@/shared/http'

import { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'
import { effetch } from '@/shared/lib/utils'

export class FigmaProvider extends BaseProvider {
  public constructor(clientId: string, clientSecret: string, redirectUri = '') {
    super('figma', clientId, clientSecret, redirectUri)
  }

  private authorizationEndpoint = 'https://www.figma.com/oauth'
  private tokenEndpoint = 'https://api.figma.com/v1/oauth/token'
  private apiEndpoint = 'https://api.figma.com/v1/me'

  public override createAuthorizationUrl = (
    state: string,
    codeVerifier: string
  ): Effect.Effect<URL> =>
    this.createAuthorizationUrlWithPKCE(
      this.authorizationEndpoint,
      state,
      ['current_user:read'],
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

      const user = yield* effetch<FigmaUserResponse>(this.apiEndpoint, {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })

      return {
        id: user.id,
        name: user.handle,
        email: user.email,
        image: user.img_url,
      }
    })
}

interface FigmaUserResponse {
  id: string
  handle: string
  email: string
  img_url: string
}
