import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { DrizzleAccountRepository } from '@/modules/auth/infrastructure/persistence/drizzle/account.repository'
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/persistence/drizzle/session.repository'
import { InMemoryAccountRepository } from '@/modules/auth/infrastructure/persistence/in-memory/account.repository'
import { InMemorySessionRepository } from '@/modules/auth/infrastructure/persistence/in-memory/session.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export class AuthInfrastructureModule {
  public static create(driver: AppModule.Config['persistentDriver']) {
    const persistenceLayer =
      driver === 'in-memory' ? this.inMemory : this.drizzle

    return Layer.mergeAll(persistenceLayer)
  }

  private static get inMemory() {
    return Layer.mergeAll(
      InMemoryAccountRepository,
      InMemorySessionRepository
    ).pipe(Layer.provide(InMemoryClient.layer))
  }

  private static get drizzle() {
    return Layer.mergeAll(
      DrizzleAccountRepository,
      DrizzleSessionRepository
    ).pipe(Layer.provide(DrizzleClient.layer))
  }
}
