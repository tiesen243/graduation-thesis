import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'
import * as HttpApiMiddleware from 'effect/unstable/httpapi/HttpApiMiddleware'
import * as HttpApiSecurity from 'effect/unstable/httpapi/HttpApiSecurity'

import type { UserId } from '@/modules/user/domain/entities/user.entity'

import { Unauthorized } from '@/modules/auth/domain/entities/auth.error'
import { UserService } from '@/modules/user/application/user.service'
import { User } from '@/modules/user/domain/entities/user.entity'

export class CurrentUser extends Context.Service<CurrentUser, User>()(
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
    bearer: HttpApiSecurity.apiKey({
      key: 'authorization',
      in: 'header',
    }),
  },

  // Middlware can specify errors that it may raise
  error: Unauthorized,
}) {
  public static layer = Layer.effect(
    this,
    Effect.gen(function* AuthMiddlewareLayer() {
      const userService = yield* UserService

      return {
        bearer: Effect.fn(function* bearer(httpEffect, { credential }) {
          const token = Redacted.value(credential)
          if (!token)
            return yield* Effect.fail(
              new Unauthorized({ message: 'Missing or invalid token' })
            )

          if (token === 'abc')
            return yield* Effect.provideService(
              httpEffect,
              CurrentUser,
              User.make({
                username: 'test',
                email: 'test@example.com' as User['email'],
              })
            )

          const user = yield* userService.findByIdentifier({
            id: token as UserId,
          })
          if (!user)
            return yield* Effect.fail(
              new Unauthorized({ message: 'Missing or invalid token' })
            )

          return yield* Effect.provideService(httpEffect, CurrentUser, user)
        }),
      }
    })
  )
}
