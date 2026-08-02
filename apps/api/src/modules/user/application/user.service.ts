import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { User } from '@/modules/user/domain/entities/user.entity'
import { UserRepository } from '@/modules/user/domain/repositories/user.repository'

export class UserService extends Context.Service<
  UserService,
  {
    readonly findByIdentifier: (
      identifier: Partial<Pick<User, 'id' | 'username' | 'email'>>
    ) => Effect.Effect<User | null>

    readonly create: (
      input: Pick<User, 'username' | 'email' | 'image'>
    ) => Effect.Effect<User>
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

      create: Effect.fn(function* make(input) {
        const user = User.make({
          username: input.username,
          email: input.email,
          image: input.image,
        })

        yield* userRepository.save(user)

        return user
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
