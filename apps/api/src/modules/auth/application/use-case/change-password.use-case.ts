import type { ChangePasswordDto } from '@rozumari/contract/auth/dto/change-password.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import {
  AccountProvider,
  AccountProviderId,
} from '@rozumari/contract/auth/schemas/account.schema'
import { InvalidCredentials } from '@rozumari/contract/auth/schemas/auth.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { AccountRepository } from '@/modules/auth/application/ports/account.repository'
import { PasswordService } from '@/modules/auth/application/ports/password.service'
import { SessionRepository } from '@/modules/auth/application/ports/session.repository'
import { Account } from '@/modules/auth/domain/entities/account.entity'

export class ChangePasswordUseCase extends Context.Service<
  ChangePasswordUseCase,
  {
    readonly execute: (
      input: ChangePasswordDto.Input
    ) => Effect.Effect<
      ChangePasswordDto.Output,
      InvalidCredentials,
      CurrentUser
    >
  }
>()('auth/application/ChangePasswordUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository
    const sessionRepository = yield* SessionRepository

    const passwordService = yield* PasswordService

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId } = yield* CurrentUser

        const [account] = yield* accountRepository.findMany({
          where: {
            provider: { eq: AccountProvider.make('credentials') },
            providerId: { eq: AccountProviderId.make(userId) },
          },
          limit: 1,
        })

        if (!account?.password) {
          const hashedPassword = yield* passwordService.hash(input.newPassword)
          yield* accountRepository.save(
            Account.make({
              provider: AccountProvider.make('credentials'),
              providerId: AccountProviderId.make(userId),
              password: hashedPassword,
              userId,
            })
          )
          yield* sessionRepository.deleteManyByUser(userId)
          return null
        }

        if (!input.currentPassword)
          return yield* Effect.fail(new InvalidCredentials())

        const isPasswordValid = yield* passwordService.verify(
          input.currentPassword,
          account.password
        )
        if (!isPasswordValid)
          return yield* Effect.fail(new InvalidCredentials())

        const hashedPassword = yield* passwordService.hash(input.newPassword)
        yield* accountRepository.save(account.updatePassword(hashedPassword))
        yield* sessionRepository.deleteManyByUser(userId)

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
