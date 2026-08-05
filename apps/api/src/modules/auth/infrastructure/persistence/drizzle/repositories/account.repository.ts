import type { AccountSchema } from '@rozumari/contract/auth/schemas/account.schema'

import {
  AccountProvider,
  AccountProviderId,
} from '@rozumari/contract/auth/schemas/account.schema'
import { eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Account } from '@/modules/auth/domain/entities/account.entity'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { accounts } from '@/modules/auth/infrastructure/persistence/drizzle/schema'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleAccountMapper = {
  toEntity: (entity: typeof AccountSchema.Type) =>
    Account.make({
      ...entity,
      provider: AccountProvider.make(entity.provider),
      providerId: AccountProviderId.make(entity.providerId),
    }),
  toRow: structuredClone,
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
