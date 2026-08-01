import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserRepository } from '@/modules/user/domain/repositories/user.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'
import { MakeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'

export const InMemoryUserRepository = Layer.effect(
  UserRepository,
  Effect.gen(function* InMemoryUserRepository() {
    const { users } = yield* InMemoryClient
    const baseRepository = yield* MakeInMemoryRepository(users)

    return {
      ...baseRepository,
    }
  })
)
