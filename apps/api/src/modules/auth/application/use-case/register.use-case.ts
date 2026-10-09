import type { RegisterDto } from '@rozumari/contract/auth/dto/register.dto'
import type { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import type * as Crypto from 'effect/Crypto'
import type * as HttpClient from 'effect/http/HttpClient'

import {
  AccountProvider,
  AccountProviderId,
} from '@rozumari/contract/auth/schemas/account.schema'
import { UserAlreadyExists } from '@rozumari/contract/user/schemas/user.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { AccountRepository } from '@/modules/auth/application/ports/account.repository'
import { PasswordService } from '@/modules/auth/application/ports/password.service'
import { Account } from '@/modules/auth/domain/entities/account.entity'
import { UserService } from '@/modules/user/application/ports/user.service'
import { ResendService } from '@/shared/application/services/resend.service'
import { verifyTurnstileToken } from '@/shared/turnstile'
import { getGravatarUrl, withTransaction } from '@/shared/utils'

export class RegisterUseCase extends Context.Service<
  RegisterUseCase,
  {
    execute: (
      input: RegisterDto.Input
    ) => Effect.Effect<
      RegisterDto.Output,
      UserAlreadyExists | Forbidden,
      Crypto.Crypto | HttpClient.HttpClient
    >
  }
>()('auth/application/RegisterUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository

    const passwordService = yield* PasswordService
    const userService = yield* UserService
    const resendService = yield* Effect.option(ResendService)

    return {
      execute: Effect.fn(function* execute(input) {
        const {
          username,
          email,
          password: plainPassword,
          challengeToken,
        } = input
        yield* verifyTurnstileToken(challengeToken)

        const _user = yield* userService.findByIdentifier({ username, email })
        if (_user)
          return yield* Effect.fail(
            new UserAlreadyExists({ error: { username, email } })
          )

        const hashedPassword = yield* passwordService.hash(plainPassword)

        const image = yield* getGravatarUrl(email)

        yield* Effect.gen(function* executeTx() {
          const user = yield* userService.create({ username, email, image })

          const account = Account.make({
            provider: AccountProvider.make('credentials'),
            providerId: AccountProviderId.make(user.id),
            password: hashedPassword,
            userId: user.id,
          })
          yield* accountRepository.save(account)
        }).pipe(withTransaction)

        if (resendService._tag === 'Some')
          yield* resendService.value.sendEmail({
            to: [email],
            subject: 'Welcome to Rozumari!',
            html: `<h1>Welcome to Rozumari!</h1><p>Hi ${username}, thank you for registering at Rozumari. We're excited to have you on board!</p>`,
          })

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
