import * as Effect from 'effect/Effect'

import type { OAuthService } from '@/modules/auth/application/oauth.service'
import type { Http } from '@/shared/http'

import { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'
import { effetch } from '@/shared/lib/utils'

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
  ): Effect.Effect<URL> =>
    this.createAuthorizationUrlWithoutPKCE(this.authorizationEndpoint, state, [
      'email',
      'public_profile',
    ])

  public override fetchUserData = (
    code: string,
    _codeVerifier: string
  ): Effect.Effect<OAuthService.Account, Http> =>
    Effect.gen(this, function* fetchUserDataGen() {
      const token = yield* this.validateAuthorizationCode(
        this.tokenEndpoint,
        code
      )
      const searchParams = new URLSearchParams()
      searchParams.set('access_token', token.access_token)
      searchParams.set('fields', ['id', 'name', 'picture', 'email'].join(','))
      const user = yield* effetch<FacebookUserResponse>(
        `${this.apiEndpoint}?${searchParams.toString()}`
      )

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.picture.data.url,
      }
    })
}

interface FacebookUserResponse {
  id: string
  name: string
  email: string
  picture: { data: { url: string } }
}
