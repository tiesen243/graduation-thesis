import type {
  UserAlreadyDeleted,
  UserNotFound,
} from '@rozumari/contract/user/schemas/user.error'
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
      data: Pick<User, 'username' | 'email' | 'image'>
    ) => Effect.Effect<User>

    readonly update: (
      id: User['id'],
      data: Partial<Pick<User, 'image'>>
    ) => Effect.Effect<void, UserNotFound | UserAlreadyDeleted>
  }
>()('user/application/UserService') {}
