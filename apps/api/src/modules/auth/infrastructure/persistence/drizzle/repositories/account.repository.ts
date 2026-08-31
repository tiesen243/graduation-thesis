import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { AccountRepository } from '@/modules/auth/application/ports/account.repository'
import { DrizzleAccountMapper } from '@/modules/auth/infrastructure/persistence/drizzle/mappers/account.mapper'
import { accounts } from '@/modules/auth/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

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
