import type { ShowUserDto } from '@rozumari/contract/user/dto/show-user.dto'
import type { UpdateUserDto } from '@rozumari/contract/user/dto/update-user.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import { UserNotFound } from '@rozumari/contract/user/schemas/user.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserRepository } from '@/modules/user/domain/repositoties/user.repository'

export class UpdateUserUseCase extends Context.Service<
  UpdateUserUseCase,
  {
    readonly execute: (
      input: ShowUserDto.Input & UpdateUserDto.Input
    ) => Effect.Effect<
      UpdateUserDto.Output,
      UserNotFound | Forbidden,
      CurrentUser
    >
  }
>()('user/application/UpdateUserUseCase', {
  make: Effect.gen(function* make() {
    const userRepository = yield* UserRepository

    return {
      execute: Effect.fn(function* execute({ id, ...input }) {
        const { userId } = yield* CurrentUser
        if (userId === id)
          return yield* Effect.fail(
            new Forbidden({
              message: 'You cannot update your own role',
            })
          )

        const [user] = yield* userRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!user)
          return yield* Effect.fail(new UserNotFound({ error: { id } }))

        const updatedUser = user.update(input)
        yield* userRepository.save(updatedUser)

        return {
          id: updatedUser.id,
          role: updatedUser.role,
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
