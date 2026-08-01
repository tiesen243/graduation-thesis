import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Session } from '@/modules/auth/domain/entities/session.entity'
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import { sessions } from '@/modules/auth/infrastructure/persistence/drizzle/schema'
import { MakeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleSessionRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* DrizzleSessionRepository() {
    const baseRepository = yield* MakeDrizzleRepository(sessions, (row) =>
      Session.make(row as unknown as Session)
    )

    return {
      ...baseRepository,
    }
  })
)
