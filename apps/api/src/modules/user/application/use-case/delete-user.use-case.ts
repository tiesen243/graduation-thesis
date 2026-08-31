import type { DeleteUserDto } from '@rozumari/contract/user/dto/delete-user.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import { UserNotFound } from '@rozumari/contract/user/schemas/user.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserRepository } from '@/modules/user/application/ports/user.repository'

export class DeleteUserUseCase extends Context.Service<
  DeleteUserUseCase,
  {
    readonly execute: (
      input: DeleteUserDto.Input
    ) => Effect.Effect<
      DeleteUserDto.Output,
      UserNotFound | Forbidden,
      CurrentUser
    >
  }
>()('user/application/DeleteUserUseCase', {
  make: Effect.gen(function* make() {
    const userRepository = yield* UserRepository

    return {
      execute: Effect.fn(function* execute({ id }) {
        const { userId } = yield* CurrentUser
        if (userId === id)
          return yield* Effect.fail(
            new Forbidden({ message: 'You cannot delete your own account' })
          )

        const [user] = yield* userRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!user)
          return yield* Effect.fail(new UserNotFound({ error: { id } }))

        const deletedUser = user.markDeleted()
        yield* userRepository.save(deletedUser)

        return {
          id: deletedUser.id,
          deletedAt: deletedUser.deletedAt,
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
