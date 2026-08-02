import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'
import * as HttpApiMiddleware from 'effect/unstable/httpapi/HttpApiMiddleware'
import * as HttpApiSecurity from 'effect/unstable/httpapi/HttpApiSecurity'

import type { Jwt } from '@/modules/auth/application/security/jwt'

import { AuthService } from '@/modules/auth/application/auth.service'
import { JwtError } from '@/modules/auth/application/security/jwt'
import { AccessToken } from '@/modules/auth/application/types'
import { Unauthorized } from '@/modules/auth/domain/entities/auth.error'

export class CurrentUser extends Context.Service<CurrentUser, Jwt.Payload>()(
  'auth/presentation/middleware/CurrentUser'
) {}

// oxlint-disable-next-line max-classes-per-file
export class AuthMiddleware extends HttpApiMiddleware.Service<
  AuthMiddleware,
  {
    // Middleware can provide services to other middleware and endpoints, which is
    // useful for things like authentication, where you want to inject the current
    // user into the context for other endpoints to consume.
    provides: CurrentUser

    // If your middleware requires dependencies from other middleware, you can
    // specify those as well.
    requires: never
  }
>()('auth/presentation/middleware/AuthMiddleware', {
  // This middleware requires clients to also provide an implementation, to
  // inject a api key
  requiredForClient: true,

  // Middleware can optionally define security schemes, which are used to
  // generate OpenAPI docs and decode credientials from incoming requests for
  // you.
  security: {
    bearer: HttpApiSecurity.bearer,
  },

  // Middlware can specify errors that it may raise
  error: [Unauthorized, JwtError],
}) {
  public static layer = Layer.effect(
    this,
    Effect.gen(function* AuthMiddlewareLayer() {
      const authService = yield* AuthService

      return {
        bearer: Effect.fn(function* bearer(httpEffect, { credential }) {
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
        }),
      }
    })
  )
}
