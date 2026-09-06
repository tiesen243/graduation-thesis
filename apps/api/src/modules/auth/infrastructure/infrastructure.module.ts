import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { AccountRepository } from '@/modules/auth/application/ports/account.repository'
import type { SessionRepository } from '@/modules/auth/application/ports/session.repository'

import { DrizzleAccountRepository } from '@/modules/auth/infrastructure/persistence/drizzle/repositories/account.repository'
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/persistence/drizzle/repositories/session.repository'
import { InMemoryAccountRepository } from '@/modules/auth/infrastructure/persistence/in-memory/repositories/account.repository'
import { InMemorySessionRepository } from '@/modules/auth/infrastructure/persistence/in-memory/repositories/session.repository'
import { AuthServiceLayer } from '@/modules/auth/infrastructure/services/auth.service'
import { OAuthServiceLayer } from '@/modules/auth/infrastructure/services/oauth.layer'
import { PasswordServiceLayer } from '@/modules/auth/infrastructure/services/password.service'

export class AuthInfrastructureModule {
  public static create(
    driver: AppModule.Config['persistence'],
    providers: AppModule.Config['providers']
  ) {
    const infrasLayer = driver === 'in-memory' ? this.inMemory : this.drizzle

    const serviceLayer = Layer.mergeAll(
      AuthServiceLayer,
      OAuthServiceLayer(providers),
      PasswordServiceLayer()
    )

    return Layer.provideMerge(serviceLayer, infrasLayer)
  }

  private static get inMemory(): Layer.Layer<
    AccountRepository | SessionRepository
  > {
    return Layer.mergeAll(
      InMemoryAccountRepository,
      InMemorySessionRepository
    ) as never
  }

  private static get drizzle(): Layer.Layer<
    AccountRepository | SessionRepository
  > {
    return Layer.mergeAll(
      DrizzleAccountRepository,
      DrizzleSessionRepository
    ) as never
  }
}
