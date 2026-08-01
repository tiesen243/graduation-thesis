import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { OneUserDto } from '@/modules/user/application/dto/one-user.dto'

import { UserNotFound } from '@/modules/user/domain/entities/user.error'
import { UserRepository } from '@/modules/user/domain/repositories/user.repository'

export class OneUserUseCase extends Context.Service<
  OneUserUseCase,
  {
    execute: (
      input: OneUserDto.Input
    ) => Effect.Effect<OneUserDto.Output, UserNotFound>
  }
>()('user/application/OneUserUseCase', {
  make: Effect.gen(function* makeFn() {
    const userRepository = yield* Effect.service(UserRepository)

    return {
      execute: Effect.fn(function* make({ id }) {
        const user = yield* userRepository.findOne(id)

        if (!user) return yield* Effect.fail(new UserNotFound())

        return user
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
