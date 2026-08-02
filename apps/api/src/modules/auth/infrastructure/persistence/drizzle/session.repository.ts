import { eq, or } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Session } from '@/modules/auth/domain/entities/session.entity'
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import { sessions } from '@/modules/auth/infrastructure/persistence/drizzle/schema'
import { User } from '@/modules/user/domain/entities/user.entity'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { MakeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleSessionRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* DrizzleSessionRepository() {
    const { db } = yield* DrizzleClient
    const baseRepository = yield* MakeDrizzleRepository(sessions, (row) =>
      Session.make(row as unknown as Session)
    )

    return {
      ...baseRepository,

      findWithUser: Effect.fn(function* findWithUser(id) {
        const [row] = yield* db
          .select()
          .from(sessions)
          .where(eq(sessions.id, id))
          .innerJoin(users, eq(users.id, sessions.userId))
          .limit(1)
          .pipe(Effect.orDie)
        if (!row) return null

        const session = Session.make(row.sessions as Session)
        session.user = User.make(row.users as User)

        return session
      }),

      delete: ({ id, token }) =>
        db
          .delete(sessions)
          .where(or(eq(sessions.id, id ?? ''), eq(sessions.token, token ?? '')))
          .pipe(Effect.asVoid, Effect.orDie),
    }
  })
)
