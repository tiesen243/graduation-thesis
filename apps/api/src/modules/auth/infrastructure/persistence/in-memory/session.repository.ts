import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'
import { MakeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'

export const InMemorySessionRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* InMemorySessionRepository() {
    const { sessions } = yield* InMemoryClient
    const baseRepository = yield* MakeInMemoryRepository(sessions)

    return {
      ...baseRepository,
    }
  })
)
