import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { Bootstrap } from '@/bootstrap'
import type { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'

import { Http } from '@/shared/http'

export class OAuthInfrastructureModule extends Context.Tag(
  'modules/auth/infrastructure/oauth/OAuthInfrastructureModule'
)<
  OAuthInfrastructureModule,
  {
    readonly forProvider: (
      provider: string
    ) => Effect.Effect<BaseProvider, Http>
  }
>() {
  public static forProvider = (provider: string) =>
    Effect.flatMap(this, (self) => self.forProvider(provider))

  public static create = (providers: Bootstrap.Config['providers']) =>
    Layer.succeed(this, {
      forProvider: (provider: string) =>
        Effect.gen(this, function* forProviderGen() {
          for (const p of providers)
            if (p.providerName === provider) return yield* Effect.succeed(p)

          return yield* Effect.fail(
            Http.badRequest(`Unsupported provider: ${provider}`)
          )
        }),
    })
}
