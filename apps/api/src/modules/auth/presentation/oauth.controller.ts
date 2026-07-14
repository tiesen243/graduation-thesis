import * as Effect from 'effect/Effect'
import { Elysia } from 'elysia'

import { OAuthService } from '@/modules/auth/application/oauth.service'
import { authSchema } from '@/modules/auth/application/types'
import { OAuthInfrastructureModule } from '@/modules/auth/infrastructure/oauth/oauth.module'
import { generateStateOrCode } from '@/modules/auth/lib/crypto'
import { Http } from '@/shared/http'

export const OAuthController = new Elysia({
  name: 'modules/auth/presentation/OAuthController',
  prefix: '/api/auth',
})

  .guard(authSchema)

  .get('/:provider', ({ params, cookie, query }) =>
    Effect.gen(function* getProviderGen() {
      const provider = yield* OAuthInfrastructureModule.forProvider(
        params.provider
      )

      const state = generateStateOrCode()
      const code = generateStateOrCode()
      const url = yield* provider.createAuthorizationUrl(state, code)

      cookie['auth.state'].set({ value: state })
      cookie['auth.code'].set({ value: code })
      cookie['auth.redirect'].set({ value: query.redirect_uri })

      return yield* Http.redirect(url.href)
    })
  )

  .get('/:provider/callback', ({ request, params, cookie, query }) =>
    Effect.gen(function* callbackGen() {
      const oauthService = yield* OAuthService

      const provider = yield* OAuthInfrastructureModule.forProvider(
        params.provider
      )

      const { state, code } = query
      const storedState = cookie['auth.state'].value ?? ''
      const storedCode = cookie['auth.code'].value ?? ''
      const redirectUri = cookie['auth.redirect'].value ?? '/'

      if (!state || !code || state !== storedState)
        return yield* Effect.fail(Http.badRequest('Invalid state or code'))

      const user = yield* provider.fetchUserData(code, storedCode)

      cookie['auth.state'].remove()
      cookie['auth.code'].remove()
      cookie['auth.redirect'].remove()

      return yield* oauthService
        .login({ ...user, provider: params.provider })
        .pipe(
          Effect.flatMap(({ accessToken, refreshToken, expiresAt }) => {
            cookie['auth.accessToken'].set({ value: accessToken })
            cookie['auth.refreshToken'].set({
              value: refreshToken,
              expires: expiresAt,
            })

            const url = new URL(redirectUri, request.url)

            if (!redirectUri.startsWith('/')) {
              url.searchParams.set('access_token', accessToken)
              url.searchParams.set('refresh_token', refreshToken)
              url.searchParams.set('expires_at', expiresAt.toUTCString())
            }

            return Http.redirect(url.href)
          })
        )
    })
  )
