import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import type { ISessionRepository } from '@/modules/auth/domain/repositories/session.repository'

import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import { BaseRepository } from '@/shared/domain/base.repository'
import { StoreTag } from '@/shared/infrastructure/persistence/in-memory/base.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export const InMemorySessionRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* InMemorySessionRepositoryGen() {
    const { sessions, users } = yield* InMemoryClient
    const baseRepo = (yield* BaseRepository) as ISessionRepository

    return {
      findWithUser: (id) =>
        Effect.gen(function* findWithUserGen() {
          const session = yield* Ref.get(sessions).pipe(
            Effect.map((dict) => dict.get(id))
          )
          if (!session) return null

          const user = yield* Ref.get(users).pipe(
            Effect.map((dict) => dict.get(session.userId))
          )
          if (!user) return null

          session.user = user
          return session
        }),

      find: (...args) =>
        baseRepo.find(...args).pipe(Effect.provideService(StoreTag, sessions)),
      count: (...args) =>
        baseRepo.count(...args).pipe(Effect.provideService(StoreTag, sessions)),
      save: (...args) =>
        baseRepo.save(...args).pipe(Effect.provideService(StoreTag, sessions)),
      delete: (...args) =>
        baseRepo
          .delete(...args)
          .pipe(Effect.provideService(StoreTag, sessions)),
    }
  })
)
