import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { IUserRepository } from '@/modules/user/domain/repositories/user.repository'

import { UserRepository } from '@/modules/user/domain/repositories/user.repository'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/drizzle.schema'
import { BaseRepository } from '@/shared/domain/base.repository'
import { TableTag } from '@/shared/infrastructure/persistence/drizzle/base.repository'

export const DrizzleUserRepository = Layer.effect(
  UserRepository,
  Effect.gen(function* DrizzleUserRepositoryGen() {
    const baseRepo = (yield* BaseRepository) as IUserRepository

    return {
      find: (...args) =>
        baseRepo.find(...args).pipe(Effect.provideService(TableTag, users)),
      count: (...args) =>
        baseRepo.count(...args).pipe(Effect.provideService(TableTag, users)),
      save: (...args) =>
        baseRepo.save(...args).pipe(Effect.provideService(TableTag, users)),
      delete: (...args) =>
        baseRepo.delete(...args).pipe(Effect.provideService(TableTag, users)),
    }
  })
)
