import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { RefreshTokenDto } from '@/modules/auth/application/dto/refresh-token.dto'
import type { JwtError } from '@/modules/auth/application/security/jwt'
import type { Unauthorized } from '@/modules/auth/domain/entities/auth.error'

import { AuthService } from '@/modules/auth/application/auth.service'

export class RefreshTokenUseCase extends Context.Service<
  RefreshTokenUseCase,
  {
    execute: (
      input: RefreshTokenDto.Input
    ) => Effect.Effect<RefreshTokenDto.Output, JwtError | Unauthorized>
  }
>()('auth/application/RefreshTokenUseCase', {
  make: Effect.gen(function* make() {
    const authService = yield* AuthService

    return {
      execute: Effect.fn(function* execute({ token }) {
        const { user } = yield* authService.verifyRefreshToken(token)
        return yield* authService.createRefreshToken(user.id)
      }),
    }
  }),
}) {
  public static layer = Layer.effect(this, this.make)
}
