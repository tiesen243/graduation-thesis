import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { LogoutDto } from '@/modules/auth/application/dto/logout.dto'

import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'

export class LogoutUseCase extends Context.Service<
  LogoutUseCase,
  {
    execute: (input: LogoutDto.Input) => Effect.Effect<LogoutDto.Output>
  }
>()('auth/application/LogoutUseCase', {
  make: Effect.gen(function* make() {
    const sessionRepository = yield* SessionRepository

    return {
      execute: Effect.fn(function* execute({ token }) {
        yield* sessionRepository.delete({ token })

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
