import { Unauthorized } from '@rozumari/contract/auth/schemas/auth.error'
import {
  CurrentDevice,
  DeviceMiddleware,
} from '@rozumari/contract/device/middleware'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'

import { Jwt } from '@/shared/application/services/jwt.service'

export const deviceMiddleware = Layer.effect(
  DeviceMiddleware,
  Effect.gen(function* deviceMiddlewareGen() {
    const jwt = yield* Jwt

    return {
      bearer: Effect.fn(function* bearer(httpEffect, { credential }) {
        const token = Redacted.value(credential)
        if (!token)
          return yield* Effect.fail(
            new Unauthorized({ message: 'Missing token' })
          )

        const { sub } = yield* jwt
          .verify(token)
          .pipe(
            Effect.catchTag('shared/application/services/JwtError', () =>
              Effect.fail(new Unauthorized({ message: 'Invalid token' }))
            )
          )

        return yield* Effect.provideService(httpEffect, CurrentDevice, sub)
      }),
    }
  })
)
