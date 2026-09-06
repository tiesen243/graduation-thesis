import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserRepository } from '@/modules/user/application/ports/user.repository'
import { UserService } from '@/modules/user/application/ports/user.service'
import { User } from '@/modules/user/domain/entities/user.entity'

export const UserServiceLayer = Layer.effect(
  UserService,
  Effect.gen(function* make() {
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
  })
)
