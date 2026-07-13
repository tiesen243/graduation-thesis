import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import type { IAccountRepository } from '@/modules/auth/domain/repositories/account.repository'

import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { BaseRepository } from '@/shared/domain/base.repository'
import { StoreTag } from '@/shared/infrastructure/persistence/in-memory/base.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export const InMemoryAccountRepository = Layer.effect(
  AccountRepository,
  Effect.gen(function* InMemoryAccountRepositoryGen() {
    const { accounts } = yield* InMemoryClient
    const baseRepo = (yield* BaseRepository) as IAccountRepository

    return {
      find: (...args) =>
        baseRepo.find(...args).pipe(Effect.provideService(StoreTag, accounts)),
      count: (...args) =>
        baseRepo.count(...args).pipe(Effect.provideService(StoreTag, accounts)),
      save: (entity) =>
        Ref.update(accounts, (dict) => {
          dict.set(`${entity.provider}_${entity.providerAccountId}`, entity)
          return dict
        }),

      delete: (entity) =>
        Ref.update(accounts, (dict) => {
          dict.delete(`${entity.provider}_${entity.providerAccountId}`)
          return dict
        }),
    }
  })
)
