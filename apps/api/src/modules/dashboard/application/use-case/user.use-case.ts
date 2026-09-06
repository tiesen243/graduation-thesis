import type { UserDto } from '@rozumari/contract/dashboard/dto/user.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DashboardRepository } from '@/modules/dashboard/application/ports/dashboard.repository'

export class UserUseCase extends Context.Service<
  UserUseCase,
  {
    execute: (
      input: UserDto.Input
    ) => Effect.Effect<UserDto.Output, never, CurrentUser>
  }
>()('dashboard/application/UserUseCase', {
  make: Effect.gen(function* make() {
    const dashboardRepository = yield* DashboardRepository

    return {
      execute: () =>
        // oxlint-disable-next-line unicorn/no-array-method-this-argument
        Effect.flatMap(CurrentUser, ({ userId }) =>
          dashboardRepository.getDataByUserId(userId)
        ),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
