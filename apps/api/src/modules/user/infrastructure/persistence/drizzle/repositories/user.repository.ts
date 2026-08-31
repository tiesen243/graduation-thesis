import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserRepository } from '@/modules/user/application/ports/user.repository'
import { DrizzleUserMapper } from '@/modules/user/infrastructure/persistence/drizzle/mappers/user.mapper'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleUserRepository = Layer.effect(
  UserRepository,
  Effect.gen(function* DrizzleUserRepository() {
    const repository = yield* makeDrizzleRepository(
      users,
      users.id,
      DrizzleUserMapper
    )

    return {
      ...repository,
    }
  })
)
