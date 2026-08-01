import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { User } from '@/modules/user/domain/entities/user.entity'
import { UserRepository } from '@/modules/user/domain/repositories/user.repository'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { MakeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleUserRepository = Layer.effect(
  UserRepository,
  Effect.gen(function* DrizzleUserRepository() {
    const baseRepository = yield* MakeDrizzleRepository(users, (row) =>
      User.make(row as unknown as User)
    )

    return {
      ...baseRepository,
    }
  })
)
