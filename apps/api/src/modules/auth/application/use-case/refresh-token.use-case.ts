import type { TokensSchema } from '@/modules/auth/application/types'

import { AuthService } from '@/modules/auth/application/auth.service'
import { createUseCase } from '@/shared/lib/utils'

export const refreshTokenUseCase = createUseCase<
  { token: string },
  TokensSchema
>(
  (input) =>
    function* refreshTokenUseCaseGen() {
      const authService = yield* AuthService

      const session = yield* authService.verifyRefreshToken(input.token)

      return yield* authService.createSession({
        userId: session.user.id,
        role: session.user.role,
      })
    }
)
