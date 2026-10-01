import type { ShowUserDto } from '@rozumari/contract/user/dto/show-user.dto'
import type { UpdateUserDto } from '@rozumari/contract/user/dto/update-user.dto'
import type { UserAlreadyDeleted } from '@rozumari/contract/user/schemas/user.error'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import { UserNotFound } from '@rozumari/contract/user/schemas/user.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserRepository } from '@/modules/user/application/ports/user.repository'

export class UpdateUserUseCase extends Context.Service<
  UpdateUserUseCase,
  {
    readonly execute: (
      input: ShowUserDto.Input & UpdateUserDto.Input
    ) => Effect.Effect<
      UpdateUserDto.Output,
      UserNotFound | UserAlreadyDeleted | Forbidden,
      CurrentUser
    >
  }
>()('user/application/UpdateUserUseCase', {
  make: Effect.gen(function* make() {
    const userRepository = yield* UserRepository

    return {
      execute: Effect.fn(function* execute({ id, role, username }) {
        const { userId, userRole } = yield* CurrentUser

        const [user] = yield* userRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!user)
          return yield* Effect.fail(new UserNotFound({ error: { id } }))

        let updatedUser = user

        if (role && role !== user.role) {
          if (userRole !== 'admin')
            return yield* Effect.fail(
              new Forbidden({
                message: 'You are not allowed to change user role',
              })
            )

          if (userId === user.id)
            return yield* Effect.fail(
              new Forbidden({ message: 'You cannot change your own role' })
            )
          updatedUser = yield* user.update({ role })
        }

        if (username && username !== user.username) {
          const [existingUser] = yield* userRepository.findMany({
            where: { username: { eq: username } },
            limit: 1,
          })
          if (existingUser && existingUser.id !== user.id)
            return yield* Effect.fail(
              new Forbidden({ message: 'Username already exists' })
            )
          updatedUser = yield* updatedUser.update({ username })
        }

        if (updatedUser === user) return { id: user.id }

        yield* userRepository.save(updatedUser)

        return { id: updatedUser.id }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
