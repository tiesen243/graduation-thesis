import { and, eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Account } from '@/modules/auth/domain/entities/account.entity'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { accounts } from '@/modules/auth/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { MakeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleAccountRepository = Layer.effect(
  AccountRepository,
  Effect.gen(function* DrizzleAccountRepository() {
    const { db } = yield* DrizzleClient
    const baseRepository = yield* MakeDrizzleRepository(accounts, (row) =>
      Account.make(row as unknown as Account)
    )

    return {
      ...baseRepository,

      findOne: ({ provider, providerAccountId }) =>
        db
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.provider, provider),
              eq(accounts.providerAccountId, providerAccountId)
            )
          )
          .limit(1)
          .pipe(
            Effect.map((rows) =>
              rows[0] ? Account.make(rows[0] as Account) : null
            ),
            Effect.orDie
          ),

      save: (entity) =>
        db
          .insert(accounts)
          .values(entity.toJSON())
          .onConflictDoUpdate({
            target: [accounts.provider, accounts.providerAccountId],
            set: entity.toJSON(),
          })
          .pipe(Effect.asVoid, Effect.orDie),

      delete: ({ provider, providerAccountId }) =>
        db
          .delete(accounts)
          .where(
            and(
              eq(accounts.provider, provider),
              eq(accounts.providerAccountId, providerAccountId)
            )
          )
          .pipe(Effect.asVoid, Effect.orDie),
    }
  })
)
