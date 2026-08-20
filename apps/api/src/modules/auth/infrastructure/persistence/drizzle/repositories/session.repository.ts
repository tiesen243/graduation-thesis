import type { SessionSchema } from '@rozumari/contract/auth/schemas/session.schema'

import { SessionId } from '@rozumari/contract/auth/schemas/session.schema'
import { RefreshToken } from '@rozumari/contract/auth/schemas/token.schema'
import { eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { SessionUserAggregate } from '@/modules/auth/domain/entities/session-user.aggregate'
import { Session } from '@/modules/auth/domain/entities/session.entity'
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import { sessions } from '@/modules/auth/infrastructure/persistence/drizzle/schema'
import { User } from '@/modules/user/domain/entities/user.entity'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleSessionMapper = {
  toEntity: (entity: typeof SessionSchema.Type) =>
    Session.make({
      ...entity,
      id: SessionId.make(entity.id),
      token: RefreshToken.make(entity.token),
    }),
  toRow: structuredClone,
}

export const DrizzleSessionRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* DrizzleSessionRepository() {
    const { db } = yield* DrizzleClient

    const repository = yield* makeDrizzleRepository(
      sessions,
      sessions.id,
      DrizzleSessionMapper
    )

    return {
      ...repository,

      findWithUser: Effect.fn(function* findWithUser(id) {
        const [row] = yield* db
          .select()
          .from(sessions)
          .innerJoin(users, eq(sessions.userId, users.id))
          .where(eq(sessions.id, id))
          .limit(1)
          .pipe(Effect.orDie)
        if (!row) return null

        const session = DrizzleSessionMapper.toEntity(row.sessions)
        const user = User.make(row.users)

        return SessionUserAggregate.make({ session, user })
      }),

      deleteManyByUser: Effect.fn(function* deleteManyByUser(userId) {
        yield* db.delete(sessions).where(eq(sessions.userId, userId)).pipe(
          Effect.orDie
        )
      }),
    }
  })
)
