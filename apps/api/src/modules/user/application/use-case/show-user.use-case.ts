import { ShowUserDto } from '@rozumari/contract/user/dto/show-user.dto'
import { UserNotFound } from '@rozumari/contract/user/schemas/user.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserRepository } from '@/modules/user/application/ports/user.repository'

export class ShowUserUseCase extends Context.Service<
  ShowUserUseCase,
  {
    readonly execute: (
      input: ShowUserDto.Input
    ) => Effect.Effect<ShowUserDto.Output, UserNotFound>
  }
>()('user/application/ShowUserUseCase', {
  make: Effect.gen(function* make() {
    const userRepository = yield* UserRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { id } = input

        const [user] = yield* userRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!user)
          return yield* Effect.fail(new UserNotFound({ error: { id } }))

        return ShowUserDto.Output.make(user)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
