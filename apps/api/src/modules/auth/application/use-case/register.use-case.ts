import type { RegisterDto } from '@rozumari/contract/auth/dto/register.dto'

import {
  AccountProvider,
  AccountProviderId,
} from '@rozumari/contract/auth/schemas/account.schema'
import { UserAlreadyExists } from '@rozumari/contract/user/schemas/user.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

import { Password } from '@/modules/auth/application/security/password'
import { Account } from '@/modules/auth/domain/entities/account.entity'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { UserService } from '@/modules/user/application/user.service'
import { withTransaction } from '@/shared/lib/utils'

export class RegisterUseCase extends Context.Service<
  RegisterUseCase,
  {
    execute: (
      input: RegisterDto.Input
    ) => Effect.Effect<RegisterDto.Output, UserAlreadyExists, DrizzleClient>
  }
>()('auth/application/RegisterUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository

    const userService = yield* UserService
    const password = yield* Password

    return {
      execute: Effect.fn(function* execute(input) {
        const { username, email, password: plainPassword } = input

        const _user = yield* userService.findByIdentifier({ username, email })
        if (_user)
          return yield* Effect.fail(
            new UserAlreadyExists({ error: { username, email } })
          )

        const hashedPassword = yield* password.hash(plainPassword)

        return yield* withTransaction(
          Effect.gen(function* executeTx() {
            const user = yield* userService.create({ username, email })

            const account = Account.make({
              provider: AccountProvider.make('credentials'),
              providerId: AccountProviderId.make(user.id),
              password: hashedPassword,
              userId: user.id,
            })
            yield* accountRepository.save(account)

            return null
          })
        )
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
