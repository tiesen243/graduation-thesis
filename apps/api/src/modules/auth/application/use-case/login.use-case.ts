import * as Effect from 'effect/Effect'

import type { LoginDto } from '@/modules/auth/application/dto/login.dto'

import { AuthService } from '@/modules/auth/application/auth.service'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { UserService } from '@/modules/user/application/user.service'
import { Http } from '@/shared/http'
import { createUseCase } from '@/shared/lib/utils'

export const loginUseCase = createUseCase<LoginDto.Input, LoginDto.Output>(
  (input) =>
    function* loginUseCaseGen() {
      const accountRepo = yield* AccountRepository
      const userService = yield* UserService

      const authService = yield* AuthService

      const user = yield* userService.findByIidentifier(input)
      if (!user)
        return yield* Effect.fail(Http.unauthorized('Invalid credentials'))

      const [account] = yield* accountRepo.find(
        [{ provider: 'credentials', providerAccountId: user.id }],
        {},
        { limit: 1 }
      )
      if (!account || account.password === null)
        return yield* Effect.fail(Http.unauthorized('Invalid credentials'))

      const isValid = yield* AuthService.password.verify(
        account.password,
        input.password
      )
      if (!isValid)
        return yield* Effect.fail(Http.unauthorized('Invalid credentials'))

      return yield* authService.createSession({
        userId: user.id,
        role: user.role,
      })
    }
)
