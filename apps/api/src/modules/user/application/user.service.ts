import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { User } from '@/modules/user/domain/entities/user.entity'

import { UserRepository } from '@/modules/user/domain/repositories/user.repository'

export class UserService extends Context.Service<
  UserService,
  {
    findByIdentifier: (
      identifier: Partial<Pick<User, 'id' | 'username' | 'email'>>
    ) => Effect.Effect<User | null>
  }
>()('user/application/UserService', {
  make: Effect.gen(function* makeFn() {
    const userRepository = yield* Effect.service(UserRepository)

    return {
      findByIdentifier: Effect.fn(function* make(identifier) {
        const { id, username, email } = identifier

        const whereClause = []
        if (id) whereClause.push({ id })
        if (username) whereClause.push({ username })
        if (email) whereClause.push({ email })
        if (whereClause.length === 0) return null

        const [user] = yield* userRepository.findMany(whereClause, { limit: 1 })

        return user ?? null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
