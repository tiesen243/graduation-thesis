import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'
import { MakeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'

export const InMemorySessionRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* InMemorySessionRepository() {
    const { sessions, users } = yield* InMemoryClient
    const baseRepository = yield* MakeInMemoryRepository(sessions)

    return {
      ...baseRepository,

      findWithUser: Effect.fn(function* findWithUser(id) {
        const session = yield* Ref.get(sessions).pipe(
          Effect.map((dict) => dict.get(id) ?? null)
        )
        if (!session) return null

        const user = yield* Ref.get(users).pipe(
          Effect.map((dict) => dict.get(session.userId) ?? null)
        )
        if (!user) return null

        session.user = user
        return session
      }),

      delete: Effect.fn(function* deleteSession({ id, token }) {
        const session = yield* Ref.get(sessions).pipe(
          Effect.map((dict) =>
            [...dict.values()].find((s) => s.id === id && s.token === token)
          )
        )

        if (session)
          yield* Ref.update(sessions, (dict) => {
            dict.delete(session.id)
            return dict
          })
      }),
    }
  })
)
