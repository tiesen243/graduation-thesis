import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'
import { MakeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'

export const InMemoryAccountRepository = Layer.effect(
  AccountRepository,
  Effect.gen(function* InMemoryAccountRepository() {
    const { accounts } = yield* InMemoryClient
    const baseRepository = yield* MakeInMemoryRepository(accounts)

    return {
      ...baseRepository,

      findOne: ({ provider, providerAccountId }) =>
        Ref.get(accounts).pipe(
          Effect.map(
            (dict) => dict.get(`${provider}:${providerAccountId}`) ?? null
          )
        ),

      save: (entity) =>
        Ref.update(accounts, (dict) =>
          dict.set(`${entity.provider}:${entity.providerAccountId}`, entity)
        ),

      delete: ({ provider, providerAccountId }) =>
        Ref.update(accounts, (dict) => {
          dict.delete(`${provider}:${providerAccountId}`)
          return dict
        }),
    }
  })
)
