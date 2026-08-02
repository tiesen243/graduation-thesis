import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { LoginDto } from '@/modules/auth/application/dto/login.dto'
import type { JwtError } from '@/modules/auth/application/security/jwt'
import type { PasswordError } from '@/modules/auth/application/security/password'
import type {
  AccountProvider,
  AccountProviderAccountId,
} from '@/modules/auth/domain/entities/account.entity'
import type { Unauthorized } from '@/modules/auth/domain/entities/auth.error'

import { AuthService } from '@/modules/auth/application/auth.service'
import { Password } from '@/modules/auth/application/security/password'
import { InvalidCredentials } from '@/modules/auth/domain/entities/auth.error'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { UserService } from '@/modules/user/application/user.service'

export class LoginUseCase extends Context.Service<
  LoginUseCase,
  {
    execute: (
      input: LoginDto.Input
    ) => Effect.Effect<
      LoginDto.Output,
      InvalidCredentials | JwtError | PasswordError | Unauthorized
    >
  }
>()('auth/application/LoginUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository
    const authService = yield* AuthService
    const userService = yield* UserService

    const password = yield* Password

    return {
      execute: Effect.fn(function* execute(input) {
        const user = yield* userService.findByIdentifier({
          email: input.email,
        })
        if (!user) return yield* Effect.fail(new InvalidCredentials())

        const account = yield* accountRepository.findOne({
          provider: 'credentials' as AccountProvider,
          providerAccountId: user.id as unknown as AccountProviderAccountId,
        })
        if (!account?.password)
          return yield* Effect.fail(new InvalidCredentials())

        const isPasswordValid = yield* password.verify(
          input.password,
          account.password
        )
        if (!isPasswordValid)
          return yield* Effect.fail(new InvalidCredentials())

        return yield* authService.createRefreshToken(user.id)
      }),
    }
  }),
}) {
  public static layer = Layer.effect(this, this.make)
}
