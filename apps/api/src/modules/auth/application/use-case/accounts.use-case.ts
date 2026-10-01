import type { AccountsDto } from '@rozumari/contract/auth/dto/accounts.dto'
import type { AccountProvider } from '@rozumari/contract/auth/schemas/account.schema'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { AccountRepository } from '@/modules/auth/application/ports/account.repository'

export class AccountsUseCase extends Context.Service<
  AccountsUseCase,
  {
    readonly execute: (
      input: AccountsDto.Input
    ) => Effect.Effect<AccountsDto.Output, never, CurrentUser>
  }
>()('auth/application/AccountsUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository

    return {
      execute: Effect.fn(function* execute() {
        const { userId } = yield* CurrentUser

        const accounts = yield* accountRepository.findMany({
          where: {
            userId: { eq: userId },
            NOT: [{ provider: { eq: 'credentials' as AccountProvider } }],
          },
          orderBy: { provider: 'asc' },
        })

        return accounts
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
