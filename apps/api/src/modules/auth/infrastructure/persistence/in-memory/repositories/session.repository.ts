import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import { SessionRepository } from '@/modules/auth/application/ports/session.repository'
import { SessionUserAggregate } from '@/modules/auth/domain/entities/session-user.aggregate'
import { makeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export const InMemorySessionRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* DrizzleSessionRepository() {
    const { db } = yield* InMemoryClient
    const repository = yield* makeInMemoryRepository(
      db.sessions,
      (entity) => entity.id
    )

    return {
      ...repository,

      findWithUser: Effect.fn(function* findWithUser(id) {
        const session = yield* Ref.get(db.sessions).pipe(
          Effect.map((dict) => dict.get(id))
        )
        if (!session) return null

        const user = yield* Ref.get(db.users).pipe(
          Effect.map((dict) => dict.get(session.userId))
        )
        if (!user) return null

        return SessionUserAggregate.make({ session, user })
      }),

      deleteManyByUser: Effect.fn(function* deleteManyByUser(userId) {
        yield* Ref.update(db.sessions, (dict) => {
          const next = new Map(dict)
          for (const [id, session] of next)
            if (session.userId === userId) next.delete(id)

          return next
        })
      }),
    }
  })
)
