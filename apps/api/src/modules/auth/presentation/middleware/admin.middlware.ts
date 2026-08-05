import {
  AdminMiddleware,
  CurrentUser,
} from '@rozumari/contract/auth/middleware'
import { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import { UserRole } from '@rozumari/contract/user/schemas/user.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

export const adminMiddleware = Layer.succeed(
  AdminMiddleware,
  AdminMiddleware.of((httpEffect) =>
    Effect.gen(function* adminMiddleware() {
      const { userRole } = yield* CurrentUser

      if (userRole !== UserRole.make('admin'))
        return yield* Effect.fail(new Forbidden())

      return yield* httpEffect
    })
  )
)
