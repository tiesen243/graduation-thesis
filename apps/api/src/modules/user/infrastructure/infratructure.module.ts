import * as Layer from 'effect/Layer'

import type { Bootstrap } from '@/bootstrap'

import { UserInfrastructureDrizzleModule } from '@/modules/user/infrastructure/persistence/drizzle/drizzle.module'
import { UserInfrastructureInMemoryModule } from '@/modules/user/infrastructure/persistence/in-memory/in-memory.module'
import { InfrastructureModule } from '@/shared/infrastructure/infratructure.module'

export class UserInfrastructureModule {
  public static create(driver: Bootstrap.Config['persistenceDriver']) {
    const persistenceModule =
      driver === 'in-memory' ? this.inMemory : this.drizzle

    return {
      persistenceModule,
    }
  }

  private static inMemory = UserInfrastructureInMemoryModule.pipe(
    Layer.provide(InfrastructureModule.inMemory)
  )

  private static drizzle = UserInfrastructureDrizzleModule.pipe(
    Layer.provide(InfrastructureModule.drizzle)
  )
}
