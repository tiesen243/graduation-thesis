import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import * as HttpServerRequest from 'effect/unstable/http/HttpServerRequest'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { RefreshToken } from '@/modules/auth/application/types'
import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { LogoutUseCase } from '@/modules/auth/application/use-case/logout.use-case'
import { RefreshTokenUseCase } from '@/modules/auth/application/use-case/refresh-token.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.use-case'
import { COOKIE_KEYS, COOKIE_OPTIONS } from '@/modules/auth/constants'
import { Unauthorized } from '@/modules/auth/domain/entities/auth.error'
import {
  LoginSuccess,
  LogoutSuccess,
  RefreshTokenSuccess,
  RegisterSuccess,
  WhoamiSuccess,
} from '@/modules/auth/presentation/api/auth.group'
import { CurrentUser } from '@/modules/auth/presentation/api/auth.middleware'
import { UserService } from '@/modules/user/application/user.service'

export const AuthHandler = HttpApiBuilder.group(Api, 'auth', (handlers) =>
  handlers
    .handle('login', ({ payload }) =>
      LoginUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map((data) =>
          LoginSuccess.make({
            message: 'Login successful',
            data,
          })
        )
      )
    )

    .handle('register', ({ payload }) =>
      RegisterUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map((data) =>
          RegisterSuccess.make({
            message: 'Registration successful',
            data,
          })
        )
      )
    )

    .handle(
      'whoami',
      Effect.fn(function* whoami() {
        const userService = yield* UserService

        const { userId } = yield* CurrentUser

        const user = yield* userService.findByIdentifier({ id: userId })
        if (!user)
          return yield* Effect.fail(
            new Unauthorized({ message: 'User not found' })
          )

        if (user.deletedAt !== null)
          return yield* Effect.fail(
            new Unauthorized({ message: 'User is deleted' })
          )

        return WhoamiSuccess.make({
          message: 'Get current user successful',
          data: user,
        })
      })
    )

    .handle(
      'logout',
      Effect.fn(function* logout() {
        const token = yield* getRefreshToken

        yield* LogoutUseCase.use((s) => s.execute({ token }))

        return yield* HttpServerResponse.json(
          LogoutSuccess.make({ message: 'Logout successful' })
        ).pipe(
          Effect.flatMap(
            HttpServerResponse.setCookie(COOKIE_KEYS.refreshToken, '', {
              ...COOKIE_OPTIONS,
              maxAge: 0,
            })
          ),

          Effect.flatMap(
            HttpServerResponse.setCookie(COOKIE_KEYS.accessToken, '', {
              ...COOKIE_OPTIONS,
              maxAge: 0,
            })
          ),

          Effect.orDie
        )
      })
    )

    .handle(
      'refresh-token',
      Effect.fn(function* refreshToken() {
        const token = yield* getRefreshToken

        const { accessToken, refreshToken, expiresAt } =
          yield* RefreshTokenUseCase.use((s) => s.execute({ token }))

        const response = yield* HttpServerResponse.json(
          RefreshTokenSuccess.make({
            message: 'Refresh token successful',
            data: { accessToken, refreshToken, expiresAt },
          })
        ).pipe(
          Effect.flatMap(
            HttpServerResponse.setCookie(
              COOKIE_KEYS.refreshToken,
              refreshToken,
              { ...COOKIE_OPTIONS, expires: expiresAt }
            )
          ),

          Effect.flatMap(
            HttpServerResponse.setCookie(COOKIE_KEYS.accessToken, accessToken, {
              ...COOKIE_OPTIONS,
              maxAge: '15 minutes',
            })
          ),

          Effect.orDie
        )

        return response
      })
    )
)

const getRefreshToken = Effect.gen(function* getSessionToken() {
  const cookies = yield* HttpServerRequest.schemaCookies(
    Schema.Struct({
      [COOKIE_KEYS.refreshToken]: Schema.optional(Schema.String),
    })
  ).pipe(
    Effect.catchTag('SchemaError', () =>
      Effect.succeed({ [COOKIE_KEYS.refreshToken]: undefined })
    )
  )

  const headers = yield* HttpServerRequest.schemaHeaders(
    Schema.Struct({
      Authorization: Schema.optional(Schema.String),
    })
  ).pipe(
    Effect.catchTag('SchemaError', () =>
      Effect.succeed({ Authorization: undefined })
    )
  )

  const token =
    cookies[COOKIE_KEYS.refreshToken] ??
    headers.Authorization?.replace('Bearer ', '') ??
    ''
  if (!token)
    return yield* Effect.fail(
      new Unauthorized({ message: 'Missing or invalid token' })
    )

  return RefreshToken.make(token)
})
