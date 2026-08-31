import type { ResetPasswordDto } from '@rozumari/contract/auth/dto/reset-password.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import {
  AccountProvider,
  AccountProviderId,
} from '@rozumari/contract/auth/schemas/account.schema'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { AccountRepository } from '@/modules/auth/application/ports/account.repository'
import { PasswordService } from '@/modules/auth/application/ports/password.service'

export class ResetPasswordUseCase extends Context.Service<
  ResetPasswordUseCase,
  {
    readonly execute: (
      input: ResetPasswordDto.Input
    ) => Effect.Effect<ResetPasswordDto.Output, never, CurrentUser>
  }
>()('auth/application/ResetPasswordUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository

    const passwordService = yield* PasswordService

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId } = yield* CurrentUser

        let [account] = yield* accountRepository.findMany({
          where: {
            provider: { eq: AccountProvider.make('credentials') },
            providerId: { eq: AccountProviderId.make(userId) },
          },
        })
        if (!account) return null

        const hashedPassword = yield* passwordService.hash(input.password)
        account = account.updatePassword(hashedPassword)
        yield* accountRepository.save(account)

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
