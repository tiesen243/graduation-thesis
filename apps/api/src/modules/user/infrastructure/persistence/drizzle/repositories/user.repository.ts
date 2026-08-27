import { UserSchema } from '@rozumari/contract/user/schemas/user.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { encodeSync } from 'effect/Schema'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { User } from '@/modules/user/domain/entities/user.entity'
import { UserRepository } from '@/modules/user/domain/repositoties/user.repository'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleUserMapper: DrizzleMapper<User, UserSchema> = {
  toEntity: (entity) => User.make(entity),
  toRow: encodeSync(UserSchema) as never,
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
