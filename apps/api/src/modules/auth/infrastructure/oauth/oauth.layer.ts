import { ProviderError } from '@rozumari/contract/auth/schemas/auth.error'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { OAuth } from '@/modules/auth/application/security/oauth'

export const OAuthLayer = (providers: AppModule.Config['auth']['providers']) =>
  Layer.succeed(OAuth, {
    forProvider: Effect.fn(function* forProvider(provider) {
      for (const p of providers)
        if (p.providerName === provider) return yield* Effect.succeed(p)

      return yield* Effect.fail(
        new ProviderError({ message: `Unsupported provider: ${provider}` })
      )
    }),
  })
