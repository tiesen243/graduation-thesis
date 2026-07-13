import { and, eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { IAccountRepository } from '@/modules/auth/domain/repositories/account.repository'

import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { accounts } from '@/modules/auth/infrastructure/persistence/drizzle/drizzle.schema'
import { BaseRepository } from '@/shared/domain/base.repository'
import { TableTag } from '@/shared/infrastructure/persistence/drizzle/base.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const DrizzleAccountRepository = Layer.effect(
  AccountRepository,
  Effect.gen(function* DrizzleAccountRepositoryGen() {
    const baseRepo = (yield* BaseRepository) as IAccountRepository
    const $ = yield* DrizzleClient

    return {
      find: (...args) =>
        baseRepo
          .find(...args)
          .pipe(Effect.provideService(TableTag, accounts as never)),
      count: (...args) =>
        baseRepo
          .count(...args)
          .pipe(Effect.provideService(TableTag, accounts as never)),
      save: (entity) =>
        $((client) =>
          client
            .insert(accounts)
            .values(entity.toPersistence())
            .onConflictDoUpdate({
              target: [accounts.provider, accounts.providerAccountId],
              set: entity.toPersistence(),
            })
        ),
      delete: (entity) =>
        $((client) =>
          client
            .delete(accounts)
            .where(
              and(
                eq(accounts.provider, entity.provider),
                eq(accounts.providerAccountId, entity.providerAccountId)
              )
            )
        ),
    }
  })
)
