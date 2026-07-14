import * as Layer from 'effect/Layer'

import { DrizzleBaseRepository } from '@/shared/infrastructure/persistence/drizzle/base.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryBaseRepository } from '@/shared/infrastructure/persistence/in-memory/base.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export class InfrastructureModule {
  public static inMemory = Layer.provideMerge(
    InMemoryBaseRepository,
    InMemoryClient.live
  )

  public static drizzle = Layer.provideMerge(
    DrizzleBaseRepository,
    DrizzleClient.live
  )
}
