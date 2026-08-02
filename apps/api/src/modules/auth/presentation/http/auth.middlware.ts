import type { unhandled } from 'effect/Types'
import type { HttpServerResponse } from 'effect/unstable/http/HttpServerResponse'

import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'

import { AuthMiddleware } from '@/api'
import { AuthService } from '@/modules/auth/application/auth.service'
import { AccessToken } from '@/modules/auth/application/types'
import { Unauthorized } from '@/modules/auth/domain/entities/auth.error'
import { CurrentUser } from '@/modules/auth/presentation/api/auth.middleware'

export const AuthMiddlewareHandler = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* AuthMiddlewareLayer() {
    const authService = yield* AuthService

    const handler = Effect.fn(function* handler(
      httpEffect: Effect.Effect<HttpServerResponse, unhandled, CurrentUser>,
      { credential }: { credential: Redacted.Redacted<string> }
    ) {
      const token = Redacted.value(credential)
      if (!token)
        return yield* Effect.fail(
          new Unauthorized({ message: 'Missing or invalid token' })
        )

      const payload = yield* authService.verifyAccessToken(
        AccessToken.make(token)
      )
      if (!payload)
        return yield* Effect.fail(
          new Unauthorized({ message: 'Missing or invalid token' })
        )

      return yield* Effect.provideService(httpEffect, CurrentUser, payload)
    })

    return {
      bearer: handler,
      cookie: handler,
    }
  })
)
