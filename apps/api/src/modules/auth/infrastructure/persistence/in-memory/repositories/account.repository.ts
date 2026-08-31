import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { AccountRepository } from '@/modules/auth/application/ports/account.repository'
import { makeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export const InMemoryAccountRepository = Layer.effect(
  AccountRepository,
  Effect.gen(function* DrizzleAccountRepository() {
    const { db } = yield* InMemoryClient
    const repository = yield* makeInMemoryRepository(
      db.accounts,
      (entity) => `${entity.provider}:${entity.providerId}`
    )

    return {
      ...repository,
    }
  })
)
