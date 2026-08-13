import type { Crypto } from 'effect/Crypto'

import { RefreshTokenDto } from '@rozumari/contract/auth/dto/refresh-token.dto'
import { InvalidToken } from '@rozumari/contract/auth/schemas/auth.error'
import { RefreshToken } from '@rozumari/contract/auth/schemas/token.schema'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'
import * as HttpServerRequest from 'effect/unstable/http/HttpServerRequest'

import { AuthService } from '@/modules/auth/application/auth.service'
import { COOKIE_KEYS } from '@/modules/auth/constants'

export class RefreshTokenUseCase extends Context.Service<
  RefreshTokenUseCase,
  {
    execute: (
      input: RefreshTokenDto.Input
    ) => Effect.Effect<
      RefreshTokenDto.Output,
      InvalidToken,
      Crypto | HttpServerRequest.HttpServerRequest
    >
  }
>()('auth/application/RefreshTokenUseCase', {
  make: Effect.gen(function* make() {
    const authService = yield* AuthService

    return {
      execute: Effect.fn(function* execute(input) {
        const { authorization } = input

        const cookies = yield* HttpServerRequest.schemaCookies(
          Schema.Struct({
            [COOKIE_KEYS.REFRESH_TOKEN]: Schema.optional(Schema.String),
          })
        ).pipe(Effect.orDie)

        const refreshToken = RefreshToken.make(
          cookies[COOKIE_KEYS.REFRESH_TOKEN] ?? authorization ?? ''
        )
        if (!refreshToken) return yield* Effect.fail(new InvalidToken())

        const {
          user,
          session: { expiresAt },
        } = yield* authService.verifyRefreshToken(refreshToken)

        const accessToken = yield* authService.createAccessToken(
          user.id,
          user.role
        )

        return RefreshTokenDto.Output.make({
          refreshToken,
          accessToken,
          expiresAt,
        })
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
