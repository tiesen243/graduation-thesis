import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'

import { ApiResponseSchema } from '@/shared/schema'

export class ProviderError extends Schema.TaggedErrorClass<ProviderError>()(
  'auth/application/ProviderError',
  ApiResponseSchema(),
  { httpApiStatus: 400 }
) {}

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
