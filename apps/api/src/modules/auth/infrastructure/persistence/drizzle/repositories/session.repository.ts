import { eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { ISessionRepository } from '@/modules/auth/domain/repositories/session.repository'

import { Session } from '@/modules/auth/domain/entities/session.entity'
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import { sessions } from '@/modules/auth/infrastructure/persistence/drizzle/drizzle.schema'
import { User } from '@/modules/user/domain/entities/user.entity'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/drizzle.schema'
import { BaseRepository } from '@/shared/domain/base.repository'
import { TableTag } from '@/shared/infrastructure/persistence/drizzle/base.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const DrizzleSessionRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* DrizzleSessionRepositoryGen() {
    const baseRepo = (yield* BaseRepository) as ISessionRepository
    const $ = yield* DrizzleClient

    return {
      findWithUser: (id) =>
        $((client) =>
          client
            .select()
            .from(sessions)
            .where(eq(sessions.id, id))
            .innerJoin(users, eq(users.id, sessions.userId))
            .limit(1)
        ).pipe(
          Effect.map(([row]) => {
            if (!row?.sessions || !row.users) return null
            const session = new Session(row.sessions)

            session.user = new User(row.users)
            return session
          })
        ),

      find: (...args) =>
        baseRepo.find(...args).pipe(Effect.provideService(TableTag, sessions)),
      count: (...args) =>
        baseRepo.count(...args).pipe(Effect.provideService(TableTag, sessions)),
      save: (...args) =>
        baseRepo.save(...args).pipe(Effect.provideService(TableTag, sessions)),
      delete: (...args) =>
        baseRepo
          .delete(...args)
          .pipe(Effect.provideService(TableTag, sessions)),
    }
  })
)
