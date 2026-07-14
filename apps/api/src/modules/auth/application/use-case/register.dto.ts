import * as Effect from 'effect/Effect'

import type { RegisterDto } from '@/modules/auth/application/dto/register.dto'

import { AuthService } from '@/modules/auth/application/auth.service'
import { Account } from '@/modules/auth/domain/entities/account.entity'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { UserService } from '@/modules/user/application/user.service'
import { Http } from '@/shared/http'
import { createUseCase } from '@/shared/lib/utils'

export const RegisterUseCase = createUseCase<
  RegisterDto.Input,
  RegisterDto.Output
>(
  ({ username, email, password }) =>
    function* registerUseCaseGen() {
      const userService = yield* UserService

      const accountRepo = yield* AccountRepository

      let user = yield* userService.findByIidentifier({ email, username })
      if (user) return yield* Effect.fail(Http.conflict('User already exists'))

      user = yield* userService.create({ username, email, image: null })

      const account = Account.make({
        provider: 'credentials',
        providerAccountId: user.id,
        password: yield* AuthService.password.hash(password),

        userId: user.id,
      })
      yield* accountRepo.save(account)
    }
)
