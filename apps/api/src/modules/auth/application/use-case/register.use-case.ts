import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { RegisterDto } from '@/modules/auth/application/dto/register.dto'
import type { PasswordError } from '@/modules/auth/application/security/password'

import { Password } from '@/modules/auth/application/security/password'
import {
  Account,
  AccountProvider,
  AccountProviderAccountId,
} from '@/modules/auth/domain/entities/account.entity'
import { Conflict } from '@/modules/auth/domain/entities/auth.error'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { UserService } from '@/modules/user/application/user.service'

export class RegisterUseCase extends Context.Service<
  RegisterUseCase,
  {
    execute: (
      input: RegisterDto.Input
    ) => Effect.Effect<RegisterDto.Output, Conflict | PasswordError>
  }
>()('auth/application/RegisterUseCase', {
  make: Effect.gen(function* make() {
    const userService = yield* UserService
    const accountRepository = yield* AccountRepository
    const password = yield* Password

    return {
      execute: Effect.fn(function* execute(input) {
        const user = yield* userService.findByIdentifier({
          username: input.username,
          email: input.email,
        })
        if (user)
          return yield* Effect.fail(
            new Conflict({ message: 'User already exists' })
          )

        const newUser = yield* userService.create({
          username: input.username,
          email: input.email,
          image: null,
        })

        const account = Account.make({
          provider: AccountProvider.make('credentials'),
          providerAccountId: AccountProviderAccountId.make(newUser.id),
          userId: newUser.id,
          password: yield* password.hash(input.password),
        })
        yield* accountRepository.save(account)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
