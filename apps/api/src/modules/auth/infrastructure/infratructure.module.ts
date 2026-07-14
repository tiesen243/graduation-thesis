import * as Layer from 'effect/Layer'

import type { Bootstrap } from '@/bootstrap'

import { AuthInfrastructureDrizzleModule } from '@/modules/auth/infrastructure/persistence/drizzle/drizzle.module'
import { AuthInfrastructureInMemoryModule } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory.module'
import { InfrastructureModule } from '@/shared/infrastructure/infratructure.module'

export class AuthInfrastructureModule {
  public static create(driver: Bootstrap.Config['persistenceDriver']) {
    const persistenceModule =
      driver === 'in-memory' ? this.inMemory : this.drizzle

    return {
      persistenceModule,
    }
  }

  private static inMemory = AuthInfrastructureInMemoryModule.pipe(
    Layer.provide(InfrastructureModule.inMemory)
  )

  private static drizzle = AuthInfrastructureDrizzleModule.pipe(
    Layer.provide(InfrastructureModule.drizzle)
  )
}
