import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { IUserRepository } from '@/modules/user/domain/repositories/user.repository'

import { UserRepository } from '@/modules/user/domain/repositories/user.repository'
import { BaseRepository } from '@/shared/domain/base.repository'
import { StoreTag } from '@/shared/infrastructure/persistence/in-memory/base.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export const InMemoryUserRepository = Layer.effect(
  UserRepository,
  Effect.gen(function* InMemoryUserRepositoryGen() {
    const { users } = yield* InMemoryClient
    const baseRepo = (yield* BaseRepository) as IUserRepository

    return {
      find: (...args) =>
        baseRepo.find(...args).pipe(Effect.provideService(StoreTag, users)),
      count: (...args) =>
        baseRepo.count(...args).pipe(Effect.provideService(StoreTag, users)),
      save: (...args) =>
        baseRepo.save(...args).pipe(Effect.provideService(StoreTag, users)),
      delete: (...args) =>
        baseRepo.delete(...args).pipe(Effect.provideService(StoreTag, users)),
    }
  })
)
