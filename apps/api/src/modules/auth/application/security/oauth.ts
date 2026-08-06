import type { ProviderError } from '@rozumari/contract/auth/schemas/auth.error'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'

import type { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'

// oxlint-disable-next-line eslint/max-classes-per-file
export class OAuth extends Context.Service<
  OAuth,
  {
    readonly forProvider: (
      provider: string
    ) => Effect.Effect<BaseProvider, ProviderError>
  }
>()('auth/application/OAuth') {
  public static forProvider = (provider: string) =>
    Effect.flatMap(this, (self) => self.forProvider(provider))
}
