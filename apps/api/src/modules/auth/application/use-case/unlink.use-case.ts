import type { UnlinkDto } from '@rozumari/contract/auth/dto/unlink.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { ProviderError } from '@rozumari/contract/auth/schemas/auth.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { AccountRepository } from '@/modules/auth/application/ports/account.repository'

export class UnlinkUseCase extends Context.Service<
  UnlinkUseCase,
  {
    readonly execute: (
      input: UnlinkDto.Input
    ) => Effect.Effect<UnlinkDto.Output, ProviderError, CurrentUser>
  }
>()('auth/application/UnlinkUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId } = yield* CurrentUser
        const { provider } = input

        const [account] = yield* accountRepository.findMany({
          where: {
            userId: { eq: userId },
            provider: { eq: provider },
          },
          limit: 1,
        })
        if (!account)
          return yield* Effect.fail(
            new ProviderError({
              message: `Account with provider ${provider} not found`,
            })
          )

        yield* Effect.log(account)

        yield* accountRepository.delete(account)

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
