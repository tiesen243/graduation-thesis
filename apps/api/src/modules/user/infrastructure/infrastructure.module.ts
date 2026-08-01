import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { DrizzleUserRepository } from '@/modules/user/infrastructure/persistence/drizzle/user.repository'
import { InMemoryUserRepository } from '@/modules/user/infrastructure/persistence/in-memory/user.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export class UserInfrastructureModule {
  public static create(driver: AppModule.Config['persistentDriver']) {
    const persistenceLayer =
      driver === 'in-memory' ? this.inMemory : this.drizzle

    return Layer.mergeAll(persistenceLayer)
  }

  private static get inMemory() {
    return Layer.mergeAll(InMemoryUserRepository).pipe(
      Layer.provide(InMemoryClient.layer)
    )
  }

  private static get drizzle() {
    return Layer.mergeAll(DrizzleUserRepository).pipe(
      Layer.provide(DrizzleClient.layer)
    )
  }
}
