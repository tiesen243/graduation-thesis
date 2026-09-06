import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'

import type { User } from '@/modules/user/domain/entities/user.entity'

export class UserService extends Context.Service<
  UserService,
  {
    readonly findByIdentifier: (
      identifier: Partial<Pick<User, 'id' | 'username' | 'email'>>
    ) => Effect.Effect<User | null>

    readonly create: (
      data: Pick<User, 'username' | 'email'>
    ) => Effect.Effect<User>
  }
>()('user/application/UserService') {}
