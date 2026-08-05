import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { User } from '@/modules/user/domain/entities/user.entity'
import { UserRepository } from '@/modules/user/domain/repositoties/user.repository'

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
>()('user/application/UserService', {
  make: Effect.gen(function* make() {
    const userRepository = yield* UserRepository

    return {
      findByIdentifier: Effect.fn(function* findByIdentifier(identifier) {
        const { id, username, email } = identifier

        const where = {
          OR: {
            ...(id ? { id: { eq: id } } : {}),
            ...(username ? { username: { eq: username } } : {}),
            ...(email ? { email: { eq: email } } : {}),
          },
        }

        const [user] = yield* userRepository.findMany({ where, limit: 1 })

        return user ?? null
      }),

      create: Effect.fn(function* create(data) {
        const { username, email } = data

        const user = User.make({ username, email, image: null })
        yield* userRepository.save(user)

        return user
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
