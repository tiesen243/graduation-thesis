import type { WhoAmIDto } from '@rozumari/contract/auth/dto/whoami.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { Unauthorized } from '@rozumari/contract/auth/schemas/auth.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserService } from '@/modules/user/application/user.service'

export class WhoAmIUseCase extends Context.Service<
  WhoAmIUseCase,
  {
    execute: (
      input: WhoAmIDto.Input
    ) => Effect.Effect<WhoAmIDto.Output, Unauthorized, CurrentUser>
  }
>()('auth/application/WhoAmiUseCase', {
  make: Effect.gen(function* make() {
    const userService = yield* UserService

    return {
      execute: Effect.fn(function* execute() {
        const { userId } = yield* CurrentUser

        const user = yield* userService.findByIdentifier({ id: userId })
        if (!user)
          return yield* Effect.fail(
            new Unauthorized({ message: 'User not found' })
          )

        return user
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
