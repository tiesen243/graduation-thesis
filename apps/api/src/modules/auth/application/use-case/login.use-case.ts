import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { LoginDto } from '@/modules/auth/application/dto/login.dto'
import type {
  AccountProvider,
  AccountProviderAccountId,
} from '@/modules/auth/domain/entities/account.entity'

import { InvalidCredentials } from '@/modules/auth/domain/entities/auth.error'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { UserService } from '@/modules/user/application/user.service'

export class LoginUseCase extends Context.Service<
  LoginUseCase,
  {
    execute: (
      input: LoginDto.Input
    ) => Effect.Effect<LoginDto.Output, InvalidCredentials>
  }
>()('auth/application/LoginUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository
    const userService = yield* UserService

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

        const isPasswordValid = account.password === input.password // Replace with proper password hashing and comparison
        if (!isPasswordValid)
          return yield* Effect.fail(new InvalidCredentials())

        return {
          accessToken: 'dummy-access-token',
          refreshToken: 'dummy-refresh-token',
          expiresAt: new Date(Date.now() + 3600 * 1000),
        } as LoginDto.Output
      }),
    }
  }),
}) {
  public static layer = Layer.effect(this, this.make)
}
