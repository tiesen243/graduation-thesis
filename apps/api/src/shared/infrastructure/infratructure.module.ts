import * as Layer from 'effect/Layer'

import type { Bootstrap } from '@/bootstrap'

import { UserInfrastructureDrizzleModule } from '@/modules/user/infrastructure/persistence/drizzle/drizzle.module'
import { UserInfrastructureInMemoryModule } from '@/modules/user/infrastructure/persistence/in-memory/in-memory.module'
import { DrizzleBaseRepository } from '@/shared/infrastructure/persistence/drizzle/base.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryBaseRepository } from '@/shared/infrastructure/persistence/in-memory/base.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

// oxlint-disable-next-line typescript/no-extraneous-class
export class InfrastructureModule {
  public static create(driver: Bootstrap.Config['persistenceDriver']) {
    const persistenceModule =
      driver === 'in-memory' ? this.inMemory : this.drizzle

    return {
      persistenceModule,
    }
  }

  private static inMemory = Layer.mergeAll(
    UserInfrastructureInMemoryModule
  ).pipe(
    Layer.provide(InMemoryBaseRepository),
    Layer.provideMerge(InMemoryClient.live)
  )

  private static drizzle = Layer.mergeAll(UserInfrastructureDrizzleModule).pipe(
    Layer.provide(DrizzleBaseRepository),
    Layer.provideMerge(DrizzleClient.live)
  )
}
