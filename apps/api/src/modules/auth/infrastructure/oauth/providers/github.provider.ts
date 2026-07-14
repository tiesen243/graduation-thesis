import * as Effect from 'effect/Effect'

import type { OAuthService } from '@/modules/auth/application/oauth.service'
import type { Http } from '@/shared/http'

import { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'
import { effetch } from '@/shared/lib/utils'

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
  ): Effect.Effect<URL> =>
    this.createAuthorizationUrlWithPKCE(
      this.authorizationEndpoint,
      state,
      ['read:user', 'user:email'],
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

      const user = yield* effetch<GithubUserResponse>(this.apiEndpoint, {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatar_url,
      }
    })
}

interface GithubUserResponse {
  id: string
  name: string
  email: string
  avatar_url: string
}
