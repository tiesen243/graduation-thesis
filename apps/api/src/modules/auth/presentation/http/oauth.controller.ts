import type {
  UserId,
  UserRole,
} from '@rozumari/contract/user/schemas/user.schema'

import { Api } from '@rozumari/contract'
import {
  AccountProvider,
  AccountProviderId,
} from '@rozumari/contract/auth/schemas/account.schema'
import { ProviderError } from '@rozumari/contract/auth/schemas/auth.error'
import * as Effect from 'effect/Effect'
import * as FetchHttpClient from 'effect/unstable/http/FetchHttpClient'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { AuthService } from '@/modules/auth/application/auth.service'
import { OAuth } from '@/modules/auth/application/security/oauth'
import { COOKIE_KEYS, COOKIE_OPTIONS } from '@/modules/auth/constants'
import { Account } from '@/modules/auth/domain/entities/account.entity'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { generateStateOrCode } from '@/modules/auth/infrastructure/security/crypto/random'
import { UserService } from '@/modules/user/application/user.service'

export const oauthController = HttpApiBuilder.group(
  Api,
  'oauth',
  Effect.fn(function* oauthController(handlers) {
    const accountRepository = yield* AccountRepository

    const authService = yield* AuthService
    const userService = yield* UserService

    return handlers
      .handle(
        'authorize',
        Effect.fn(function* authorizeHandler({ params, query }) {
          const provider = yield* OAuth.forProvider(params.provider)

          const state = generateStateOrCode()
          const code = generateStateOrCode()

          const authorizeUrl = yield* provider.createAuthorizationUrl(
            state,
            code
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
          const provider = yield* OAuth.forProvider(params.provider)

          const { code, state } = query
          const storedCode = request.cookies[COOKIE_KEYS.OAUTH_CODE]
          const storedState = request.cookies[COOKIE_KEYS.OAUTH_STATE]

          const isMissingParams = !code || !state || !storedCode || !storedState
          if (isMissingParams || state !== storedState)
            return yield* Effect.fail(
              new ProviderError({ message: 'Invalid state parameter' })
            )

          const { id, email } = yield* provider
            .fetchUserData(code, storedCode)
            .pipe(Effect.provide(FetchHttpClient.layer))
            .pipe(Effect.orDie)

          const [[account], user] = yield* Effect.all([
            accountRepository.findMany({
              where: {
                provider: { eq: AccountProvider.make(params.provider) },
                providerId: { eq: AccountProviderId.make(id) },
              },
              limit: 1,
            }),
            userService.findByIdentifier({ email }),
          ])

          let userId: UserId, userRole: UserRole

          if (account && user) {
            ;({ userId } = account)
            userRole = user.role
          } else {
            const newUser = yield* userService.create({
              username: crypto.randomUUID().slice(0, 8),
              email,
            })

            userId = newUser.id
            userRole = newUser.role

            const newAccount = Account.make({
              provider: AccountProvider.make(params.provider),
              providerId: AccountProviderId.make(id),
              userId,
            })
            yield* accountRepository.save(newAccount)
          }

          const { accessToken, refreshToken, expiresAt } =
            yield* authService.createRefreshToken(userId, userRole)

          const redirectUri = new URL(
            request.cookies[COOKIE_KEYS.OAUTH_REDIRECT] ?? '/'
          )
          if (redirectUri.origin !== request.originalUrl) {
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
          const { token } = payload

          const { user, expiresAt } =
            yield* authService.verifyRefreshToken(token)

          const accessToken = yield* authService.createAccessToken(
            user.id,
            user.role
          )

          return yield* HttpServerResponse.json({ success: true }).pipe(
            Effect.flatMap(
              HttpServerResponse.setCookies([
                [
                  COOKIE_KEYS.REFRESH_TOKEN,
                  token,
                  { ...COOKIE_OPTIONS, expires: expiresAt },
                ],
                [
                  COOKIE_KEYS.ACCESS_TOKEN,
                  accessToken,
                  { ...COOKIE_OPTIONS, expires: expiresAt },
                ],
              ])
            ),
            Effect.orDie
          )
        })
      )
  })
)
