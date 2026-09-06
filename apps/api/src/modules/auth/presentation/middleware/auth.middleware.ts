import { AuthMiddleware, CurrentUser } from '@rozumari/contract/auth/middleware'
import { AccessToken } from '@rozumari/contract/auth/schemas/token.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'

import { AuthService } from '@/modules/auth/application/ports/auth.service'

export const authMiddleware = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* authMiddlewareGen() {
    const authService = yield* AuthService

    const middlewareHandler = Effect.fn(function* handler(
      credential: Redacted.Redacted<string>
    ) {
      const token = Redacted.value(credential)

      const { userId, userRole } = yield* authService.verifyAccessToken(
        AccessToken.make(token)
      )

      return { userId, userRole }
    })

    return AuthMiddleware.of({
      token: (httpEffect, { credential }) =>
        Effect.provideServiceEffect(
          httpEffect,
          CurrentUser,
          middlewareHandler(credential)
        ),

      bearer: (httpEffect, { credential }) =>
        Effect.provideServiceEffect(
          httpEffect,
          CurrentUser,
          middlewareHandler(credential)
        ),
    })
  })
)
