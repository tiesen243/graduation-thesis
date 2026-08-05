import type { UserSchema } from '@rozumari/contract/user/schemas/user.schema'

import { UserId, UserRole } from '@rozumari/contract/user/schemas/user.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { User } from '@/modules/user/domain/entities/user.entity'
import { UserRepository } from '@/modules/user/domain/repositoties/user.repository'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleUserMapper = {
  toEntity: (entity: typeof UserSchema.Type) =>
    User.make({
      ...entity,
      id: UserId.make(entity.id),
      role: UserRole.make(entity.role),
    }),
  toRow: structuredClone,
}

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
