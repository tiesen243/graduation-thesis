import type { ResetPasswordDto } from '@rozumari/contract/auth/dto/reset-password.dto'
import type { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import type * as HttpClient from 'effect/http/HttpClient'

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
import { verifyTurnstileToken } from '@/shared/turnstile'

export class ResetPasswordUseCase extends Context.Service<
  ResetPasswordUseCase,
  {
    readonly execute: (
      input: ResetPasswordDto.Input
    ) => Effect.Effect<
      ResetPasswordDto.Output,
      Forbidden,
      CurrentUser | HttpClient.HttpClient
    >
  }
>()('auth/application/ResetPasswordUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository

    const passwordService = yield* PasswordService

    return {
      execute: Effect.fn(function* execute(input) {
        const { password, challengeToken } = input
        const { userId } = yield* CurrentUser

        yield* verifyTurnstileToken(challengeToken)

        let [account] = yield* accountRepository.findMany({
          where: {
            provider: { eq: AccountProvider.make('credentials') },
            providerId: { eq: AccountProviderId.make(userId) },
          },
        })
        if (!account) return null

        const hashedPassword = yield* passwordService.hash(password)
        account = account.updatePassword(hashedPassword)
        yield* accountRepository.save(account)

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
