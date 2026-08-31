import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserRepository } from '@/modules/user/application/ports/user.repository'
import { makeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export const InMemoryUserRepository = Layer.effect(
  UserRepository,
  Effect.gen(function* DrizzleUserRepository() {
    const { db } = yield* InMemoryClient
    const repository = yield* makeInMemoryRepository(
      db.users,
      (entity) => entity.id
    )

    return {
      ...repository,
    }
  })
)
