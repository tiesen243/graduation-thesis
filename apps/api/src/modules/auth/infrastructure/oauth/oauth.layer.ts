import { ProviderError } from '@rozumari/contract/auth/schemas/auth.error'
import { Effect, Layer } from 'effect'

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
