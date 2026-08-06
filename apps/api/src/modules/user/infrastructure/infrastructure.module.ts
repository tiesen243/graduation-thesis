import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { DrizzleUserRepository } from '@/modules/user/infrastructure/persistence/drizzle/repositories/user.repository'
import { InMemoryUserRepository } from '@/modules/user/infrastructure/persistence/in-memory/repositories/user.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export class UserInfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const layer = driver === 'in-memory' ? this.inMemory : this.drizzle

    return Layer.mergeAll(layer)
  }

  private static get inMemory() {
    return Layer.mergeAll(InMemoryUserRepository).pipe(
      Layer.provideMerge(InMemoryClient.layer)
    )
  }

  private static get drizzle() {
    return Layer.mergeAll(DrizzleUserRepository).pipe(
      Layer.provideMerge(DrizzleClient.layer)
    )
  }
}
