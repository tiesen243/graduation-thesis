import { AccountSchema } from '@rozumari/contract/auth/schemas/account.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { encodeSync } from 'effect/Schema'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { Account } from '@/modules/auth/domain/entities/account.entity'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { accounts } from '@/modules/auth/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleAccountMapper: DrizzleMapper<Account, AccountSchema> = {
  toEntity: (entity) => Account.make(entity),
  toRow: encodeSync(AccountSchema) as never,
}

export const DrizzleAccountRepository = Layer.effect(
  AccountRepository,
  Effect.gen(function* DrizzleAccountRepository() {
    yield* DrizzleClient

    const repository = yield* makeDrizzleRepository(
      accounts,
      [accounts.provider, accounts.providerId],
      DrizzleAccountMapper
    )

    return {
      ...repository,
    }
  })
)
