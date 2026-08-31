import { Api } from '@rozumari/contract'
import { ProviderError } from '@rozumari/contract/auth/schemas/auth.error'
import * as Effect from 'effect/Effect'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { OAuthUseCase } from '@/modules/auth/application/use-case/oauth.use-case'
import { COOKIE_KEYS, COOKIE_OPTIONS } from '@/modules/auth/domain/constants'
import { generateStateOrCode } from '@/modules/auth/domain/utils/crypto'

export const oauthController = HttpApiBuilder.group(
  Api,
  'oauth',
  (handlers) => 
    handlers
      .handle(
        'authorize',
        Effect.fn(function* authorizeHandler({ params, query }) {
          const state = yield* generateStateOrCode
          const code = yield* generateStateOrCode

          const authorizeUrl = yield* OAuthUseCase.use((s) =>
            s.authorize(params.provider, state, code)
          )

          return yield* HttpServerResponse.redirect(authorizeUrl).pipe(
            HttpServerResponse.setCookies([
              [
                COOKIE_KEYS.OAUTH_STATE,
                state,
                { ...COOKIE_OPTIONS, maxAge: '5 minutes' },
              ],
              [
                COOKIE_KEYS.OAUTH_CODE,
                code,
                { ...COOKIE_OPTIONS, maxAge: '5 minutes' },
              ],
              [
                COOKIE_KEYS.OAUTH_REDIRECT,
                query.redirect_uri ?? '/',
                { ...COOKIE_OPTIONS, maxAge: '5 minutes' },
              ],
            ]),
            Effect.orDie
          )
        })
      )

      .handle(
        'callback',
        Effect.fn(function* callbackHandler({ params, query, request }) {
          const { code, state } = query
          const storedCode = request.cookies[COOKIE_KEYS.OAUTH_CODE]
          const storedState = request.cookies[COOKIE_KEYS.OAUTH_STATE]

          const isMissingParams = !code || !state || !storedCode || !storedState
          if (isMissingParams || state !== storedState)
            return yield* Effect.fail(
              new ProviderError({ message: 'Invalid state parameter' })
            )

          const { accessToken, refreshToken, expiresAt } =
            yield* OAuthUseCase.use((s) =>
              s.callback(params.provider, code, storedCode)
            )

          const original = new URL(request.originalUrl)
          const redirectUri = new URL(
            (request.cookies[COOKIE_KEYS.OAUTH_REDIRECT] ?? '/').replace(
              /^(?<protocol>https?|exp):\/(?!\/)/u,
              '$1://'
            ),
            original.origin
          )
          if (redirectUri.origin !== original.origin) {
            redirectUri.searchParams.set('access_token', accessToken)
            redirectUri.searchParams.set('refresh_token', refreshToken)
          }

          return yield* HttpServerResponse.redirect(redirectUri).pipe(
            HttpServerResponse.setCookies([
              [
                COOKIE_KEYS.REFRESH_TOKEN,
                refreshToken,
                { ...COOKIE_OPTIONS, expires: expiresAt },
              ],
              [
                COOKIE_KEYS.ACCESS_TOKEN,
                accessToken,
                { ...COOKIE_OPTIONS, expires: expiresAt },
              ],

              // Clean up OAuth cookies
              [
                COOKIE_KEYS.OAUTH_STATE,
                '',
                { ...COOKIE_OPTIONS, maxAge: '0 seconds' },
              ],
              [
                COOKIE_KEYS.OAUTH_CODE,
                '',
                { ...COOKIE_OPTIONS, maxAge: '0 seconds' },
              ],
              [
                COOKIE_KEYS.OAUTH_REDIRECT,
                '',
                { ...COOKIE_OPTIONS, maxAge: '0 seconds' },
              ],
            ]),
            Effect.orDie
          )
        })
      )

      .handle(
        'exchange',
        Effect.fn(function* exchangeHandler({ payload }) {
          const { accessToken, refreshToken, expiresAt } =
            yield* OAuthUseCase.use((s) => s.exchange(payload.token))

          return yield* HttpServerResponse.json({ success: true }).pipe(
            Effect.flatMap(
              HttpServerResponse.setCookies([
                [
                  COOKIE_KEYS.REFRESH_TOKEN,
                  refreshToken,
                  { ...COOKIE_OPTIONS, expires: expiresAt },
                ],
                [
                  COOKIE_KEYS.ACCESS_TOKEN,
                  accessToken,
                  { ...COOKIE_OPTIONS, maxAge: '15 minutes' },
                ],
              ])
            ),
            Effect.orDie
          )
        })
      )
  
)
