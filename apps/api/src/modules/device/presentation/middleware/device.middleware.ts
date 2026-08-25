import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import {
  CurrentDevice,
  DeviceMiddleware,
} from '@rozumari/contract/device/middleware'
import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'

import { Jwt } from '@/shared/infrastructure/jwt'

export const deviceMiddleware = Layer.effect(
  DeviceMiddleware,
  Effect.gen(function* deviceMiddlewareGen() {
    const jwt = yield* Jwt

    return {
      bearer: Effect.fn(function* bearer(httpEffect, { credential }) {
        const token = Redacted.value(credential)
        if (!token)
          return yield* Effect.fail(
            new DeviceNotFound({ error: { id: '' as DeviceId } })
          )

        const { sub } = yield* jwt.verify(token).pipe(Effect.orDie)
        return yield* Effect.provideService(httpEffect, CurrentDevice, sub)
      }),
    }
  })
)
