import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import * as FetchHttpClient from 'effect/unstable/http/FetchHttpClient'
import * as HttpServerRequest from 'effect/unstable/http/HttpServerRequest'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import type { UserId } from '@/modules/user/domain/entities/user.entity'

import { Api } from '@/api'
import { AuthService } from '@/modules/auth/application/auth.service'
import { OAuth, ProviderError } from '@/modules/auth/application/security/oauth'
import { COOKIE_KEYS, COOKIE_OPTIONS } from '@/modules/auth/constants'
import {
  Account,
  AccountProvider,
  AccountProviderAccountId,
} from '@/modules/auth/domain/entities/account.entity'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import {
  generateSecureString,
  generateStateOrCode,
} from '@/modules/auth/infrastructure/security/crypto/random'
import { UserService } from '@/modules/user/application/user.service'

export const OAuthHandler = HttpApiBuilder.group(
  Api,
  'oauth',
  Effect.fn(function* OAuthHandler(handlers) {
    const accountRepository = yield* AccountRepository
    const authService = yield* AuthService
    const userService = yield* UserService

    const oauth = yield* OAuth

    return handlers
      .handle(
        'redirect',
        Effect.fn(function* redirectHandler({ params, query }) {
          const { provider: _provider } = params

          const provider = yield* oauth.forProvider(_provider)

          const state = generateStateOrCode()
          const code = generateStateOrCode()
          const redirect = query.redirect_uri ?? '/'
          const authorizationUrl = yield* provider.createAuthorizationUrl(
            state,
            code
          )

          const response = yield* HttpServerResponse.redirect(
            authorizationUrl
          ).pipe(
            HttpServerResponse.setCookie(
              COOKIE_KEYS.state,
              state,
              COOKIE_OPTIONS
            ),
            Effect.flatMap(
              HttpServerResponse.setCookie(
                COOKIE_KEYS.code,
                code,
                COOKIE_OPTIONS
              )
            ),
            Effect.flatMap(
              HttpServerResponse.setCookie(
                COOKIE_KEYS.redirect,
                redirect,
                COOKIE_OPTIONS
              )
            ),
            Effect.catchTag('CookieError', (e) =>
              Effect.fail(new ProviderError({ message: e.message }))
            )
          )

          return response
        })
      )
      .handle(
        'callback',
        Effect.fn(function* callbackHandler({ params, query }) {
          const { provider: _provider } = params

          const provider = yield* oauth.forProvider(_provider)

          const cookies = yield* HttpServerRequest.schemaCookies(
            Schema.Struct({
              [COOKIE_KEYS.code]: Schema.String,
              [COOKIE_KEYS.state]: Schema.String,
              [COOKIE_KEYS.redirect]: Schema.optional(Schema.String),
            })
          ).pipe(
            Effect.catchTag('SchemaError', (e) =>
              Effect.fail(new ProviderError({ message: e.message }))
            )
          )

          const { code, state } = query
          const storedCode = cookies[COOKIE_KEYS.code]
          const storedState = cookies[COOKIE_KEYS.state]
          let redirect = cookies[COOKIE_KEYS.redirect] ?? '/'

          if (!state || !storedState || state !== storedState)
            return yield* Effect.fail(
              new ProviderError({ message: 'Invalid state parameter' })
            )

          const { id, ...userData } = yield* provider
            .fetchUserData(code, storedCode)
            .pipe(
              Effect.provide(FetchHttpClient.layer),
              Effect.catchTag('SchemaError', (e) =>
                Effect.fail(new ProviderError({ message: e.message }))
              ),
              Effect.catchTag('HttpClientError', (e) =>
                Effect.fail(new ProviderError({ message: e.message }))
              )
            )

          const user = yield* accountRepository.findOne({
            provider: AccountProvider.make(_provider),
            providerAccountId: AccountProviderAccountId.make(id),
          })

          let userId: UserId
          if (user) ({ userId } = user)
          else {
            const userByEmail = yield* userService.findByIdentifier({
              email: userData.email,
            })
            if (userByEmail) userId = userByEmail.id
            else {
              const newUser = yield* userService.create({
                username: generateSecureString().slice(0, 8),
                email: userData.email,
                image: userData.image,
              })
              userId = newUser.id
            }

            const account = Account.make({
              provider: AccountProvider.make(_provider),
              providerAccountId: AccountProviderAccountId.make(id),
              userId,
            })
            yield* accountRepository.save(account)
          }

          const { accessToken, refreshToken, expiresAt } =
            yield* authService.createRefreshToken(userId)

          if (redirect.startsWith('http'))
            redirect = `${redirect}?${new URLSearchParams({ access_token: accessToken, refresh_token: refreshToken })}`

          const response = yield* HttpServerResponse.redirect(redirect).pipe(
            HttpServerResponse.setCookie(
              COOKIE_KEYS.refreshToken,
              refreshToken,
              { ...COOKIE_OPTIONS, expires: expiresAt }
            ),
            Effect.flatMap(
              HttpServerResponse.setCookie(
                COOKIE_KEYS.accessToken,
                accessToken,
                { ...COOKIE_OPTIONS, maxAge: '15 minutes' }
              )
            ),
            Effect.map((res) =>
              res.pipe(
                HttpServerResponse.removeCookie(COOKIE_KEYS.code),
                HttpServerResponse.removeCookie(COOKIE_KEYS.state),
                HttpServerResponse.removeCookie(COOKIE_KEYS.redirect)
              )
            ),
            Effect.catchTag('CookieError', (e) =>
              Effect.fail(new ProviderError({ message: e.message }))
            )
          )

          return response
        })
      )
  })
)
