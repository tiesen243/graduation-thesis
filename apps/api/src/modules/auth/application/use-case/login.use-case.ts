import type { LoginDto } from '@rozumari/contract/auth/dto/login.dto'
import type { UserNotFound } from '@rozumari/contract/user/schemas/user.error'
import type { Crypto } from 'effect/Crypto'

import {
  AccountProvider,
  AccountProviderId,
} from '@rozumari/contract/auth/schemas/account.schema'
import { InvalidCredentials } from '@rozumari/contract/auth/schemas/auth.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { AuthService } from '@/modules/auth/application/auth.service'
import { Password } from '@/modules/auth/application/security/password'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { UserService } from '@/modules/user/application/user.service'

export class LoginUseCase extends Context.Service<
  LoginUseCase,
  {
    execute: (
      input: LoginDto.Input
    ) => Effect.Effect<
      LoginDto.Output,
      InvalidCredentials | UserNotFound,
      Crypto
    >
  }
>()('auth/application/LoginUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository
    const password = yield* Password

    const authService = yield* AuthService
    const userService = yield* UserService

    return {
      execute: Effect.fn(function* execute(input) {
        const { email, password: plainPassword } = input

        const user = yield* userService.findByIdentifier({ email })
        if (!user) return yield* Effect.fail(new InvalidCredentials())

        const [account] = yield* accountRepository.findMany({
          where: {
            provider: { eq: AccountProvider.make('credentials') },
            providerId: { eq: AccountProviderId.make(user.id) },
          },
          limit: 1,
        })
        if (!account?.password)
          return yield* Effect.fail(new InvalidCredentials())

        const isPasswordValid = yield* password.verify(
          plainPassword,
          account.password
        )
        if (!isPasswordValid)
          return yield* Effect.fail(new InvalidCredentials())

        return yield* authService.createRefreshToken(user.id, user.role)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
