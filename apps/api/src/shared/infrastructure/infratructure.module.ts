import * as Layer from 'effect/Layer'

import type { Bootstrap } from '@/bootstrap'

import { DrizzleBaseRepository } from '@/shared/infrastructure/persistence/drizzle/base.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryBaseRepository } from '@/shared/infrastructure/persistence/in-memory/base.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export class InfrastructureModule {
  public static create(driver: Bootstrap.Config['persistenceDriver']) {
    const persistenceModule =
      driver === 'in-memory' ? this.inMemory : this.drizzle

    return {
      persistenceModule,
    }
  }

  private static inMemory = InMemoryBaseRepository.pipe(
    Layer.provideMerge(InMemoryClient.live)
  )

  private static drizzle = DrizzleBaseRepository.pipe(
    Layer.provideMerge(DrizzleClient.live)
  )
}
