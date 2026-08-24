import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { OAuthLayer } from '@/modules/auth/infrastructure/oauth/oauth.layer'
import { DrizzleAccountRepository } from '@/modules/auth/infrastructure/persistence/drizzle/repositories/account.repository'
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/persistence/drizzle/repositories/session.repository'
import { InMemoryAccountRepository } from '@/modules/auth/infrastructure/persistence/in-memory/repositories/account.repository'
import { InMemorySessionRepository } from '@/modules/auth/infrastructure/persistence/in-memory/repositories/session.repository'
import { PasswordLayer } from '@/modules/auth/infrastructure/security/password'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export class AuthInfrastructureModule {
  public static create(
    driver: AppModule.Config['persistence'],
    { secret, providers }: AppModule.Config['auth']
  ) {
    const layer = driver === 'in-memory' ? this.inMemory : this.drizzle

    return Layer.mergeAll(
      layer,
      PasswordLayer({ secret }),
      OAuthLayer(providers)
    )
  }

  private static get inMemory() {
    return Layer.mergeAll(
      InMemoryAccountRepository,
      InMemorySessionRepository
    ).pipe(Layer.provideMerge(InMemoryClient.layer))
  }

  private static get drizzle() {
    return Layer.mergeAll(
      DrizzleAccountRepository,
      DrizzleSessionRepository
    ).pipe(Layer.provideMerge(DrizzleClient.layer))
  }
}
