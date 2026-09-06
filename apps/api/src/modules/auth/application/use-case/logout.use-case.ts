import type { LogoutDto } from '@rozumari/contract/auth/dto/logout.dto'
import type { Crypto } from 'effect/Crypto'

import { Unauthorized } from '@rozumari/contract/auth/schemas/auth.error'
import { RefreshToken } from '@rozumari/contract/auth/schemas/token.schema'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'
import * as HttpServerRequest from 'effect/unstable/http/HttpServerRequest'

import { AuthService } from '@/modules/auth/application/ports/auth.service'
import { SessionRepository } from '@/modules/auth/application/ports/session.repository'
import { COOKIE_KEYS } from '@/modules/auth/domain/constants'

export class LogoutUseCase extends Context.Service<
  LogoutUseCase,
  {
    execute: (
      input: LogoutDto.Input
    ) => Effect.Effect<
      LogoutDto.Output,
      Unauthorized,
      Crypto | HttpServerRequest.HttpServerRequest
    >
  }
>()('auth/application/LogoutUseCase', {
  make: Effect.gen(function* make() {
    const sessionRepository = yield* SessionRepository

    const authService = yield* AuthService

    return {
      execute: Effect.fn(function* execute(input) {
        const { authorization } = input

        const cookies = yield* HttpServerRequest.schemaCookies(
          Schema.Struct({
            [COOKIE_KEYS.REFRESH_TOKEN]: Schema.optional(Schema.String),
          })
        ).pipe(Effect.orDie)

        const token = cookies[COOKIE_KEYS.REFRESH_TOKEN] ?? authorization ?? ''
        const { session } = yield* authService.verifyRefreshToken(
          RefreshToken.make(token)
        )
        if (!session) return yield* Effect.fail(new Unauthorized())

        yield* sessionRepository.delete(session)

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
