import { UserNotFound } from '@rozumari/contract/user/schemas/user.error'
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

      update: Effect.fn(function* update(id, data) {
        if (!data.image) return

        const [user] = yield* userRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })

        if (!user)
          return yield* Effect.fail(new UserNotFound({ error: { id } }))

        const updatedUser = yield* user.update(data)
        yield* userRepository.save(updatedUser)
      }),
    }
  })
)
