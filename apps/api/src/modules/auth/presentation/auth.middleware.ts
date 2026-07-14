import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import { Elysia } from 'elysia'

import type { User } from '@/modules/user/domain/entities/user.entity'

import { AuthService } from '@/modules/auth/application/auth.service'
import { authSchema } from '@/modules/auth/application/types'
import { Http } from '@/shared/http'

export const CurrentUser = Context.GenericTag<AuthService.JWTPayload>(
  'modules/auth/presentation/auth.middleware/CurrentUser'
)

export const AuthMiddleware = new Elysia({
  name: 'modules/auth/presentation/AuthMiddleware',
})

  .guard(authSchema)

  .macro({
    auth: (role: User.Role | boolean) => ({
      afterHandle: ({ headers, cookie, responseValue }) => {
        if (!Effect.isEffect(responseValue)) return responseValue

        return Effect.gen(function* authMiddlewareGen() {
          const token =
            headers.authorization?.replace('Bearer ', '') ??
            cookie['auth.accessToken']?.value ??
            ''

          if (!token)
            return yield* Effect.fail(Http.unauthorized('Invalid access token'))

          const payload = yield* AuthService.jwt.verify(token)
          if (role && typeof role !== 'boolean' && payload.role !== role)
            return yield* Effect.fail(
              Http.forbidden('Insufficient permissions')
            )

          return yield* responseValue.pipe(
            Effect.provideService(CurrentUser, payload)
          )
        })
      },
    }),
  })

  .as('plugin')
